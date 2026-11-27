"""Check the Ridgeline Outfitters MCP server outside Pentaho Data Integration.

Does what an MCP client does: starts retail_mcp_server.py as a child process
(stdio transport), initializes the session, lists the tools, calls one tool
and reads the resource. Run it from any folder:

    python check_server.py

It uses the same Python that runs it to start the server, so run it with the
Python you installed the mcp package into.
"""
import asyncio
import sys
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

SERVER = Path(__file__).resolve().parent / "retail_mcp_server.py"


async def main() -> None:
    params = StdioServerParameters(command=sys.executable, args=[str(SERVER)])
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            init = await session.initialize()
            print(f"Server: {init.serverInfo.name}, protocol {init.protocolVersion}")

            tools = (await session.list_tools()).tools
            print(f"\n{len(tools)} tools:")
            for t in tools:
                args = ", ".join(t.inputSchema.get("properties", {}))
                print(f"  {t.name}({args})")

            result = await session.call_tool("lookup_order", {"order_id": "A1001"})
            print("\nlookup_order A1001:")
            print(result.content[0].text)

            res = await session.read_resource("retail://policies/shipping")
            print("\nretail://policies/shipping, first line:")
            print(res.contents[0].text.splitlines()[0])


if __name__ == "__main__":
    asyncio.run(main())

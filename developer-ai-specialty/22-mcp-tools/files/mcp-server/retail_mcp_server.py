"""Ridgeline Outfitters MCP server for the MCP Tools workshop.

A Model Context Protocol (MCP) server for a fictional outdoor retailer. It
offers four tools and one resource over the stdio transport, from the data in
retail_data.json beside this file:

  lookup_order(order_id)            the status, delivery and items of an order
  check_stock(sku)                  the stock of one product
  get_return_policy(category)       the return policy of a product category
  start_return(order_id, sku, reason)
                                    starts a return: writes a line to
                                    returns_log.jsonl (the one tool that
                                    changes something)
  retail://policies/shipping        the shipping policy, as text

Start it with:  python retail_mcp_server.py
An MCP client (the MCP Client step, the AI Chat step's Tools tab, or
check_server.py) starts it as a child process and talks to it through its
standard input and output, so this script writes nothing else to stdout.

Needs the MCP Python SDK:  python -m pip install mcp
"""
import json
import os
from datetime import datetime, timezone
from pathlib import Path

from mcp.server.fastmcp import FastMCP

HERE = Path(__file__).resolve().parent
DATA = json.loads((HERE / "retail_data.json").read_text(encoding="utf-8"))
RETURNS_LOG = Path(os.environ.get("RETAIL_RETURNS_LOG", HERE / "returns_log.jsonl"))

PRODUCTS = {p["sku"]: p for p in DATA["products"]}
ORDERS = {o["order_id"]: o for o in DATA["orders"]}
POLICIES = {p["category"]: p for p in DATA["return_policies"]}
# Words a customer (or a model) might use for a category.
ALIASES = {
    "tent": "tents", "tents": "tents",
    "boot": "footwear", "boots": "footwear", "shoe": "footwear", "shoes": "footwear", "footwear": "footwear",
    "apparel": "apparel", "clothing": "apparel", "jacket": "apparel", "jackets": "apparel", "socks": "apparel",
    "sleeping-bag": "sleeping-bags", "sleeping-bags": "sleeping-bags", "sleeping bag": "sleeping-bags",
    "sleeping bags": "sleeping-bags",
    "cooking": "cooking", "stove": "cooking", "stoves": "cooking",
}

# WARNING keeps the SDK's per-request INFO lines out of the client's log (they go to stderr).
mcp = FastMCP("ridgeline-retail", log_level="WARNING")


def _order(order_id: str) -> dict:
    key = (order_id or "").strip().upper()
    if key not in ORDERS:
        raise ValueError(f"No order {order_id!r}. Order numbers look like A1001.")
    return ORDERS[key]


@mcp.tool()
def lookup_order(order_id: str) -> dict:
    """Look up a customer order by its order number (for example A1001).
    Returns the order's status (processing, shipped, delayed or delivered),
    the order date, the carrier and tracking number, the estimated delivery
    date, the delivery date, a status note, and the items with their SKU,
    name, category and quantity."""
    o = _order(order_id)
    items = [{"sku": i["sku"], "name": PRODUCTS[i["sku"]]["name"],
              "category": PRODUCTS[i["sku"]]["category"], "quantity": i["quantity"]} for i in o["items"]]
    return {k: o[k] for k in ("order_id", "customer_first_name", "order_date", "status", "carrier",
                              "tracking_number", "estimated_delivery", "delivered_on", "status_note")} | {
        "item_count": sum(i["quantity"] for i in items), "items": items}


@mcp.tool()
def check_stock(sku: str) -> dict:
    """Check the stock of one product by its SKU (for example TENT-2P-TL).
    Returns the product name, its category, the units on hand, the warehouse,
    and the restock date when it is out of stock."""
    key = (sku or "").strip().upper()
    if key not in PRODUCTS:
        raise ValueError(f"No product with SKU {sku!r}. Known SKUs: {', '.join(PRODUCTS)}.")
    p = PRODUCTS[key]
    return {"sku": p["sku"], "name": p["name"], "category": p["category"], "on_hand": p["on_hand"],
            "in_stock": p["on_hand"] > 0, "warehouse": p["warehouse"], "restock_date": p["restock_date"]}


@mcp.tool()
def get_return_policy(category: str) -> dict:
    """Get the return policy of a product category: tents, footwear, apparel,
    sleeping-bags or cooking. Returns the return window in days from delivery,
    the condition the item must be in, and how the refund is paid."""
    key = ALIASES.get((category or "").strip().lower().replace("_", "-"))
    if key is None:
        raise ValueError(f"No return policy for {category!r}. Categories: {', '.join(POLICIES)}.")
    return dict(POLICIES[key])


@mcp.tool()
def start_return(order_id: str, sku: str, reason: str) -> dict:
    """Start a return for one item of a delivered order. This CHANGES data:
    it records the return and gives it a return authorization (RMA) number."""
    o = _order(order_id)
    key = (sku or "").strip().upper()
    if key not in {i["sku"] for i in o["items"]}:
        raise ValueError(f"Order {o['order_id']} has no item {sku!r}.")
    if o["status"] != "delivered":
        raise ValueError(f"Order {o['order_id']} is {o['status']}, not delivered: it cannot be returned yet.")
    rec = {"rma": f"RMA-{o['order_id']}-{key}", "order_id": o["order_id"], "sku": key, "reason": reason,
           "started_at": datetime.now(timezone.utc).isoformat(timespec="seconds")}
    with RETURNS_LOG.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(rec) + "\n")
    return rec | {"status": "return started"}


@mcp.resource("retail://policies/shipping", mime_type="text/plain")
def shipping_policy() -> str:
    """Ridgeline Outfitters' shipping policy."""
    return DATA["shipping_policy"]


if __name__ == "__main__":
    mcp.run(transport="stdio")

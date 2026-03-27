import logging

logger = logging.getLogger(__name__)

_VALID_VARIANTS = {"info", "warning", "success"}
_VALID_CHART_TYPES = {"line", "bar", "pie", "scatter", "area"}


def _format_insight(item: dict) -> dict:
    variant = item.get("variant", "info")
    if variant not in _VALID_VARIANTS:
        variant = "info"
    return {
        "type": "insight",
        "variant": variant,
        "title": item.get("title", ""),
        "content": item.get("content", ""),
    }


def _format_chart(item: dict) -> dict | None:
    chart_type = item.get("chart_type", "")
    if chart_type not in _VALID_CHART_TYPES:
        logger.warning("Skipping chart with invalid chart_type: %r", chart_type)
        return None

    result: dict = {
        "type": "chart",
        "chart_type": chart_type,
        "title": item.get("title", ""),
        "data": item.get("data", {}),
    }
    for optional in ("subtitle", "summary_stat", "options", "layout"):
        if optional in item:
            result[optional] = item[optional]
    return result


def _format_table(item: dict) -> dict:
    return {
        "type": "table",
        "title": item.get("title", ""),
        "headers": item.get("headers", []),
        "rows": item.get("rows", []),
    }


def format_results(raw_results: list) -> list[dict]:
    """Validate and normalize LLM result objects for the frontend."""
    formatted = []
    for item in raw_results:
        if not isinstance(item, dict):
            logger.warning("Skipping non-dict result: %r", item)
            continue

        item_type = item.get("type")

        if item_type == "insight":
            formatted.append(_format_insight(item))
        elif item_type == "chart":
            result = _format_chart(item)
            if result is not None:
                formatted.append(result)
        elif item_type == "table":
            formatted.append(_format_table(item))
        else:
            logger.warning("Skipping result with unrecognized type: %r", item_type)

    return formatted

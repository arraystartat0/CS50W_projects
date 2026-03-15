from django import template

register = template.Library()

@register.filter
def format_number(value):
    try:
        value = int(value)
    except (ValueError, TypeError):
        return value

    if value >= 1_000_000_000:
        return f"{value/1_000_000_000:.1f}".rstrip('0').rstrip('.') + "B"
    elif value >= 1_000_000:
        return f"{value/1_000_000:.1f}".rstrip('0').rstrip('.') + "M"
    elif value >= 1_000:
        return f"{value/1_000:.1f}".rstrip('0').rstrip('.') + "k"
    else:
        return str(value)

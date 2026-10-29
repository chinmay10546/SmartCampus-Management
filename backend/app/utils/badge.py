def calculate_badge(xp: int) -> str:
    if xp >= 1500:
        return "Platinum"

    if xp >= 700:
        return "Gold"

    if xp >= 300:
        return "Silver"

    if xp >= 100:
        return "Bronze"

    return "None"
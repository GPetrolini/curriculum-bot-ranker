def calculate_score(skills: list, required_skills: list):
    if not required_skills:
        return 0

    matches = set(skills).intersection(set(required_skills))
    score = (len(matches) / len(required_skills)) * 100

    return round(score, 2)
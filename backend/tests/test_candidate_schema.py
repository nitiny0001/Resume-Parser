from app.schemas.candidate import CandidateProfile


def test_candidate_profile_defaults():
    profile = CandidateProfile(name="Nitin")
    assert profile.name == "Nitin"
    assert profile.skills == []

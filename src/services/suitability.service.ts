import axios from "axios";

export async function getSuitabilityScore() {
  const res = await axios.get("/api/suitability/score");
  return res.data;
}

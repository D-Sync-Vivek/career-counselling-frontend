import { apiClient } from "./apiClient";

// ── ROADMAP ENDPOINTS ────────────────────────────────────────────────────────

/**
 * GET /api/v1/roadmaps/generate
 * Automatically pulls student data from DB and generates the roadmap.
 */
export const getCareerRoadmap = (careerTitle) => {
  // We dropped 'notes' because the Python backend pulls it directly from Postgres now!
  const qs = new URLSearchParams();
  if (careerTitle) qs.set('career', careerTitle);
  const params = qs.toString() ? `?${qs.toString()}` : '';
  
  // Notice the updated URL path:
  return apiClient.get(`/api/v1/roadmaps/generate${params}`);
};

/**
 * POST /api/v1/roadmaps/save
 * Saves the generated roadmap to the database.
 */
export const saveRoadmap = (roadmapData) => {
  return apiClient.post("/api/v1/roadmaps/save", roadmapData);
};

/**
 * GET /api/v1/roadmaps/current
 * Fetches the student's active roadmap from the database.
 */
export const getActiveRoadmap = () => {
  return apiClient.get("/api/v1/roadmaps/current");
};

/**
 * POST /api/v1/roadmaps/start
 * Updates roadmap status to Active.
 */
export const startRoadmap = () => {
  return apiClient.post("/api/v1/roadmaps/start", {});
};

/**
 * PATCH /api/v1/roadmaps/tasks/{task_id}/complete
 * Toggles a specific task as complete/incomplete.
 */
export const toggleTaskComplete = (taskId) => {
  return apiClient.patch(`/api/v1/roadmaps/tasks/${taskId}/complete`, {});
};

// ── AI RECOMMENDATIONS ───────────────────────────────────────────────────────

/**
 * POST /api/v1/ai/recommend
 * Returns: { brutal_truth_summary, top_5_careers[{ title, rationale }] }
 */
export const getAIRecommendations = () => {
  return apiClient.post("/api/v1/ai/recommend", {});
};
/**
 * POST /api/v1/ai/select-career
 * Persists the chosen career to the database.
 */
export const selectCareerInDB = (careerTitle) => {
  return apiClient.post("/api/v1/ai/select-career", { career_title: careerTitle });
};

/**
 * GET /api/v1/ai/selected-career
 * Fetches the currently saved career from the database.
 */
export const getSelectedCareer = () => {
  return apiClient.get("/api/v1/ai/selected-career");
};
export const selectCareer = async (careerTitle) => {
  // 👉 Updated to match your Swagger UI exactly!
  const response = await apiClient.post('/api/v1/ai/select-career', {
    career_title: careerTitle
  });
  return response;
};
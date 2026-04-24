import { apiClient } from './apiClient';

export const reportApi = {
  getMyReport: async () => {
    // IMPORTANT: It just says /me! Do not pass variables here.
    const response = await apiClient.get('/api/v1/reports/me');
    return response;
  }
};
export const assessmentApi = {
  // 1. Fetch questions for a specific module (eq, orientation, interest)
  getQuestions: async (module) => {
    return await apiClient.get(`/api/v1/psychometrics/${module}/questions?limit=15`);
  },
  
  // 2. Submit the 1-5 scores
  submitScore: async (module, userId, answers) => {
    return await apiClient.post(`/api/v1/psychometrics/${module}/score`, {
      user_id: userId,
      answers: answers
    });
  }
};
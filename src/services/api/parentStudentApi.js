import { apiClient } from './apiClient';

export const parentStudentApi = {
  // 1. For the Student Dashboard to get their code
  getStudentInviteCode: async () => {
    return apiClient.get('/api/v1/students/invite-code');
  },
  
  // 2. For the Parent Dashboard to submit the code
  linkParentToStudent: async (code) => {
    // Send as a JSON body to match the Pydantic LinkStudentRequest model
    return apiClient.post('/api/v1/parents/link-student', { invite_code: code });
  },

  // 3. THIS WAS MISSING: For the Parent Dashboard to check existing links
  getLinkedStudent: async () => {
    // Note: Ensure the URL matches your FastAPI router prefix
    return apiClient.get('/api/v1/parents/linked-student');
  }
};
export const api = {
  login: async () => ({ token: 'test-token' }),
  register: async () => ({ token: 'test-token' }),
  listClients: async () => ({ data: [] }),
  createClient: async () => ({ id: 'client-id', name: 'Client' }),
  listAssessments: async () => ({ data: [] }),
  createAssessment: async () => ({ id: 'assessment-id' }),
  getScores: async () => ({ data: [] }),
  updateScores: async () => ({ data: [] }),
};

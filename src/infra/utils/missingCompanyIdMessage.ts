export const missingCompanyIdMessage = {
  statusCode: 401,
  body: JSON.stringify({ 
    data: { 
      message: 'Unauthorized: Missing company ID in path parameters.' 
    } 
  }),
};
export const load = ({ cookies }) => {
  // Get the ban reason from the cookies
  const reason = cookies.get('ban_reason');

  // Return the ban reason
  return {
    reason
  };
};
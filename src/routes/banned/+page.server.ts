export const load = ({ cookies }) => {
  const reason = cookies.get('ban_reason');

  return {
    reason
  };
};
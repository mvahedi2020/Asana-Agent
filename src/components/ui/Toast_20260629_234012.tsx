export const Toast = ({ message }: { message: string }) => {
  return <div className="fixed bottom-4 right-4 bg-zinc-800 text-white p-4 rounded-lg shadow-lg">{message}</div>;
};

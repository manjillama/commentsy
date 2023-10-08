export function Alert({ message }: { message: string }) {
  const style = {
    backgroundColor: "#3c1618",
    color: "#ff6166",
  };
  return (
    <div style={style} className="p-3 text-sm rounded-lg">
      {message}
    </div>
  );
}

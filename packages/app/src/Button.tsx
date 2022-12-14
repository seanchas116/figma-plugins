export function Button(props: { width: number; height: number }) {
  return (
    <button
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: `${props.width}px`,
        height: `${props.height}px`,
      }}
    >
      Button
    </button>
  );
}

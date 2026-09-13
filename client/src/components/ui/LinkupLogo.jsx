export function LinkupLogo({ size = 32 }) {
  return (
    <span
      role="img"
      aria-label="Linkup"
      style={{
        fontSize: size,
        width: size,
        height: size,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      &#128518;
    </span>
  );
}

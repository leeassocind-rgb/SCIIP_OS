export default function Panel({
  title,
  meta,
  children,
  action
}) {
  return (
    <section className="panel">
      <header>
        <div>
          <h3>{title}</h3>
          {meta && <p>{meta}</p>}
        </div>

        {action}
      </header>

      {children}
    </section>
  );
}

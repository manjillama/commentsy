export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200">
      <div className="max-w-screen-2xl mx-auto px-[15px] py-4">
        <div className="flex justify-between items-center">
          <div>
            <div>Commentsy &copy; {new Date().getFullYear()}</div>
            <p className="text-sm">Created by Manjil Tamang</p>
          </div>
          <div>Buy me a coffee</div>
        </div>
        <div className="flex justify-between items-center">
          <ul className="flex">
            <li>GitHub</li>
            <li>X</li>
          </ul>
          <ul className="flex">
            <li>Documentation</li>
            <li>Privacy policy</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

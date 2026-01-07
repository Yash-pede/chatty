import { Spinner } from "../spinner.js";

const DefaultPending = () => {
  return (
    <div className="flex items-center justify-center min-h-screen min-w-svw">
      <Spinner />
    </div>
  );
};

export default DefaultPending;

"use client";
import { FormEvent, useState } from "react";
import { Alert, Dialog, Spinner } from "./ui";
import { post } from "@/utils/api";
import { TrashIcon } from "@radix-ui/react-icons";
import { AppDispatch } from "@/store";
import { useDispatch } from "react-redux";
import { pushUserApp } from "@/slices/userAppsSlice";

export default function NewAppDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formProps, setFormProps] = useState({
    name: "",
    description: "",
    authorizedOrigins: [""],
  });
  const [errors, setErrors] = useState<string[]>([]);
  const dispatch: AppDispatch = useDispatch();

  const handleChange = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.currentTarget;

    if (name)
      setFormProps({
        ...formProps,
        [name]: value,
      });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = await post("/api/apps", formProps);

    if (data.status !== "success") setErrors(data.errors);
    else {
      dispatch(pushUserApp(data.data));
      setOpen(false);
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog
      open={open}
      openChange={setOpen}
      triggerText="New app"
      triggerClass="bg-black text-white py-2 px-4 rounded-lg hover:opacity-75"
    >
      <h3 className="text-2xl font-semibold mb-4">Create new app</h3>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {errors.length ? (
          <Alert>
            <ul
              style={
                errors.length > 1
                  ? { listStyleType: "disc", paddingLeft: "1rem" }
                  : {}
              }
            >
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </Alert>
        ) : null}
        <div>
          <label className="space-y-2">
            <span className="text-neutral-500">App name*</span>
            <input
              autoComplete="off"
              className="border border-neutral-300 w-full rounded-lg p-3"
              name="name"
              type="text"
              onChange={handleChange}
            />
          </label>
        </div>
        <AuthorizedOriginsField
          handleChange={handleChange}
          authorizedOrigins={formProps.authorizedOrigins}
        />
        <hr />
        <div>
          <label className="space-y-2">
            <span className="text-neutral-500">Description*</span>
            <textarea
              className="border border-neutral-300 w-full rounded-lg p-3"
              name="description"
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="flex justify-between">
          <div>
            <button
              className="py-2 px-4 block bg-white border border-neutral-200 text-black rounded-lg hover:bg-neutral-200"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
          </div>
          <div>
            <button
              disabled={isSubmitting}
              className="py-2 px-6 block bg-black border border-neutral-200 text-white rounded-lg hover:opacity-75 disabled:opacity-75 relative"
              type="submit"
            >
              {isSubmitting && (
                <div
                  style={{
                    marginLeft: -18,
                    marginTop: 2,
                  }}
                  className="absolute"
                >
                  <Spinner size="sm" />
                </div>
              )}
              Create app
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

function AuthorizedOriginsField({
  authorizedOrigins,
  handleChange,
}: {
  authorizedOrigins: string[];
  handleChange: (e: React.FormEvent<HTMLInputElement>) => void;
}) {
  function onChange(origin: string, index?: number) {
    let value = [];
    if (typeof index === "number") {
      const newOrigin = [...authorizedOrigins];
      newOrigin[index] = origin;
      value = newOrigin;
    } else value = [...authorizedOrigins, origin];

    const event = {
      currentTarget: {
        name: "authorizedOrigins",
        value,
      },
    };

    handleChange(event as any);
  }

  function removeFieldAtIndex(index: number) {
    const newOrigins = [...authorizedOrigins];
    newOrigins.splice(index, 1);
    const value = newOrigins;

    const event = {
      currentTarget: {
        name: "authorizedOrigins",
        value,
      },
    };

    handleChange(event as any);
  }

  return (
    <div>
      <label className="space-y-2">
        <span className="text-neutral-500">Authorized domains*</span>

        {authorizedOrigins.map((origin, i) => (
          <div key={i} className="flex items-center space-x-2">
            <input
              placeholder="https://www.example.com"
              autoComplete="off"
              className="border border-neutral-300 w-full rounded-lg p-3"
              name="authorizedOrigins"
              value={origin}
              type="text"
              onChange={(e: any) => onChange(e.currentTarget.value, i)}
            />
            <button
              onClick={() => removeFieldAtIndex(i)}
              className="hover:bg-neutral-200 p-2 h-[32px] w-[32px] rounded-full text-center"
            >
              <TrashIcon className="mx-auto" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => onChange("")}
          className="flex items-center py-1 px-2 bg-black text-white rounded-md text-sm hover:opacity-75"
        >
          Add URI
        </button>
      </label>
    </div>
  );
}

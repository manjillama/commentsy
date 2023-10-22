"use client";

import { FormEvent, useState } from "react";
import { Alert, Spinner } from "../ui";
import api from "@/utils/api";
import { TrashIcon } from "@radix-ui/react-icons";
import { AppDispatch } from "@/store";
import { useDispatch } from "react-redux";
import { pushUserApp, refetchUserApps } from "@/slices/userAppsSlice";
import Toast from "../ui/toast";

type Props =
  | { from: "dialog"; type: "new"; setOpen: (open: boolean) => void }
  | { from: "settings"; type: "new" }
  | {
      from: "settings";
      type: "edit";
      initialFormProps: FormProps;
      appId: string;
    };
type FormProps = {
  name: string;
  description: string;
  authorizedOrigins: string[];
};
export default function AppForm(props: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [formProps, setFormProps] = useState<FormProps>(
    (props as any).initialFormProps ?? {
      name: "",
      description: "",
      authorizedOrigins: [""],
    }
  );
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
    setErrors([]);
    let data;
    if (props.type === "new") data = await api.post("/api/apps", formProps);
    else data = await api.patch(`/api/apps/${props.appId}`, formProps);
    if (data.status !== "success") setErrors(data.errors);
    else {
      props.type === "new"
        ? dispatch(pushUserApp(data.data))
        : dispatch(refetchUserApps());
      if (props.from === "dialog") props.setOpen(false);
      setShowSuccessToast(true);
    }
    setIsSubmitting(false);
  };

  return (
    <div>
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
              value={formProps.name}
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
              value={formProps.description}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="flex justify-between">
          {props.from === "dialog" && (
            <div>
              <button
                className="py-2 px-4 block bg-white border border-neutral-200 text-black rounded-lg hover:bg-neutral-200"
                onClick={() => props.setOpen(false)}
              >
                Cancel
              </button>
            </div>
          )}
          <div />
          <div>
            <button
              disabled={isSubmitting}
              className="flex space-x-2 py-2 px-4 bg-black border border-neutral-200 text-white rounded-lg hover:opacity-75 disabled:opacity-75 relative"
              type="submit"
            >
              {isSubmitting && (
                <div className="h-[20px] w-[20px] text-left">
                  <Spinner color="light" size="sm" />
                </div>
              )}
              <span>{props.type === "new" ? "Create app" : "Save"}</span>
            </button>
          </div>
        </div>
      </form>
      {showSuccessToast && (
        <Toast
          message="Your app has been updated."
          onOpenChange={setShowSuccessToast}
        />
      )}
    </div>
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
              type="button"
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

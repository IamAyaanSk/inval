"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputErrorTooltip } from "@/components/input-error-tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorAlert } from "@/components/error-alert";
import {
  useApiKeysQuery,
  useCreateApiKeyMutation,
  useDeleteApiKeyMutation,
} from "@/lib/queries/api-keys";
import { formatDate } from "@/lib/utils";
import {
  createApiKeyFormSchema,
  type CreateApiKeyFormValues,
} from "@/lib/validations/api-keys";

import { ExternalLink } from "lucide-react";

export function ApiKeysView() {
  const { data: apiKeys, isLoading, isError, error } = useApiKeysQuery();
  const createMutation = useCreateApiKeyMutation();
  const deleteMutation = useDeleteApiKeyMutation();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const form = useForm<CreateApiKeyFormValues>({
    resolver: zodResolver(createApiKeyFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: CreateApiKeyFormValues) => {
    try {
      const res = await createMutation.mutateAsync({
        name: values.name.trim(),
      });
      if (res?.key) {
        setCreatedKey(res.key);
        reset();
        toast.success("API key created successfully");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create API key",
      );
    }
  };

  const handleDeleteKey = (id: string, name?: string | null) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success(`API key ${name || ""} deleted`),
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : "Failed to delete API key",
        ),
    });
  };

  const copyToClipboard = (text: string, isCurl = false) => {
    navigator.clipboard.writeText(text);
    if (isCurl) {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
    toast.success("Copied to clipboard");
  };

  const sampleCurl = `curl -X GET "${typeof window !== "undefined" ? window.location.origin : ""}/api/documents" \\
  -H "x-api-key: ${createdKey || "<YOUR_API_KEY>"}"`;

  const handleOpenDialog = () => {
    setCreatedKey(null);
    reset();
    setCreateDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">API Keys</h2>
          <p className="text-lg text-secondary-foreground/40 font-semibold tracking-tight -mt-1">
            Manage your API keys
          </p>
        </div>

        <Button type="button" onClick={handleOpenDialog}>
          Create New Key
        </Button>
      </div>

      {isError && (
        <ErrorAlert error={error} fallbackMessage="Failed to load API keys" />
      )}

      <div className="flex flex-col gap-8 px-2">
        <div className="flex flex-col gap-0.5 items-baseline">
          <h3 className="text-lg font-semibold">Active API Keys</h3>
          <span className="text-xs text-muted-foreground">
            API keys allow external applications to authenticate with the API
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : !apiKeys || apiKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-10 text-center">
            <p className="text-sm font-medium text-foreground">
              No API keys found
            </p>
            <p className="text-xs text-muted-foreground">
              Create your first API key to start integrating via the API.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleOpenDialog}
              className="text-xs mt-2"
            >
              Create First Key
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-xs text-card-foreground transition-colors hover:border-foreground/20"
              >
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate">
                      {key.name || "Untitled Key"}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">
                      {key.start ? `${key.start}...` : "sk_..."}
                    </code>
                    <span>·</span>
                    <span>
                      Created{" "}
                      {formatDate(new Date(key.createdAt).toISOString())}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteKey(key.id, key.name)}
                  disabled={deleteMutation.isPending}
                  className="text-xs text-muted-foreground hover:text-destructive shrink-0"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 px-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5 items-baseline">
            <h3 className="text-lg font-semibold">API Usage</h3>
            <span className="text-xs text-muted-foreground">
              Include your key in the x-api-key header or Authorization Bearer
              header. View{" "}
              <a
                href="https://github.com/IamAyaanSk/inval#api-reference"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium underline hover:text-primary/80 inline-flex items-center gap-0.5"
              >
                API Endpoints <ExternalLink className="size-3" />
              </a>
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => copyToClipboard(sampleCurl, true)}
            className="text-xs"
          >
            {copiedCurl ? "Copied" : "Copy cURL"}
          </Button>
        </div>

        <pre className="overflow-x-auto rounded-2xl bg-card p-5 text-xs font-mono text-foreground border shadow-xs">
          {sampleCurl}
        </pre>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {createdKey ? "API Key Created" : "Create API Key"}
            </DialogTitle>
            <DialogDescription>
              {createdKey
                ? "Copy your API key now. For security reasons, it will not be shown again."
                : "Enter a name for your API key to identify its usage."}
            </DialogDescription>
          </DialogHeader>

          {createdKey ? (
            <div className="flex flex-col gap-4 py-2">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                Make sure to copy this key now. You will not be able to see it
                again!
              </div>

              <FieldGroup>
                <Field>
                  <FieldLabel className="text-xs">Generated Key</FieldLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={createdKey}
                      className="font-mono text-xs select-all bg-muted"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => copyToClipboard(createdKey)}
                      className="shrink-0"
                    >
                      {copiedKey ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </Field>
              </FieldGroup>

              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setCreatedKey(null);
                    reset();
                  }}
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <FieldGroup className="py-2">
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="api-key-name" className="text-xs">
                        Key Name
                      </FieldLabel>
                      <div className="relative flex items-center">
                        <Input
                          {...field}
                          id="api-key-name"
                          placeholder="e.g. Development Key, Mobile App"
                          disabled={createMutation.isPending || isSubmitting}
                          aria-invalid={fieldState.invalid}
                          autoFocus
                        />
                        <InputErrorTooltip error={fieldState.error} />
                      </div>
                    </Field>
                  )}
                />
              </FieldGroup>

              <DialogFooter className="mt-4" showCloseButton>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || isSubmitting}
                >
                  {createMutation.isPending || isSubmitting
                    ? "Creating..."
                    : "Create Key"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

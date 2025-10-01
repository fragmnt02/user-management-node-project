import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/atoms/alert";
import { User, MapPin, Globe, Loader2, AlertCircle } from "lucide-react";

type Props = {
  onSubmit: (data: {
    name: string;
    zipCode: string;
    country?: string;
  }) => Promise<void>;
  initial?: { name?: string; zipCode?: string; country?: string };
};

export default function UserForm({
  onSubmit,
  initial,
}: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [zip, setZip] = useState(initial?.zipCode ?? "");
  const [country, setCountry] = useState(initial?.country ?? "US");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isEditMode = !!initial?.name;

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(null);
        setLoading(true);
        try {
          await onSubmit({ name, zipCode: zip, country });
          if (!isEditMode) {
            setName("");
            setZip("");
            setCountry("US");
          }
        } catch (e: { message: string } | unknown) {
          setErr((e as { message: string })?.message ?? "Something went wrong");
        } finally {
          setLoading(false);
        }
      }}
      aria-describedby={err ? "form-error" : undefined}
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
              <User className="h-3.5 w-3.5 text-blue-600" />
            </div>
            Full Name
          </Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
            className="transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 h-12 text-base"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="zip" className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <div className="p-1.5 bg-green-100 dark:bg-green-950/30 rounded-lg">
                <MapPin className="h-3.5 w-3.5 text-green-600" />
              </div>
              ZIP / Postal Code
            </Label>
            <Input
              id="zip"
              required
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="e.g., 10001"
              className="transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 h-12 text-base"
              disabled={loading}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="country" className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
                <Globe className="h-3.5 w-3.5 text-purple-600" />
              </div>
              Country Code
            </Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value.toUpperCase())}
              placeholder="US"
              maxLength={2}
              className="transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 h-12 text-base"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground bg-slate-50 dark:bg-slate-800/50 px-3 py-1 rounded-lg">ISO-2 country code</p>
          </div>
        </div>
      </div>

      {err && (
        <Alert variant="destructive" id="form-error" role="alert" className="animate-fade-in-up border-red-200 bg-red-50/80 backdrop-blur-sm dark:border-red-800 dark:bg-red-950/80">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-200">{err}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        disabled={loading || !name.trim() || !zip.trim()} 
        className="w-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-soft hover:shadow-soft-lg h-12 text-base font-semibold"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {isEditMode ? "Updating..." : "Creating..."}
          </>
        ) : (
          <>
            {isEditMode ? "Update User" : "Create User"}
          </>
        )}
      </Button>
    </form>
  );
}

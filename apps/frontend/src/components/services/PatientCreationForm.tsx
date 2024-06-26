import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card.tsx";
import { trpc } from "@/utils/trpc";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { PopoverContent } from "../ui/popover";
import { CheckIcon } from "lucide-react";
// import { useAuth0 } from "@auth0/auth0-react";
import { ZCreatePatientSchema } from "common";
import { Input } from "@/components/ui/input.tsx";
import { DateTime } from "luxon";
import { Textarea } from "@/components/ui/textarea.tsx";

const preprocessNested = (v: unknown) => {
  if (typeof v !== "object" || !v) {
    return undefined;
  }
  if (
    "connect" in v &&
    typeof v.connect === "object" &&
    v.connect &&
    "id" in v.connect &&
    v.connect.id !== "" &&
    v.connect.id !== undefined
  ) {
    return v;
  }

  return undefined;
};

// Add your type-specific form schema to this array.
const FormSchema = ZCreatePatientSchema.extend({
  user: z.preprocess(
    preprocessNested,
    z.object({ connect: z.object({ id: z.string() }) }).optional(),
  ),
  pcp: z.preprocess(
    preprocessNested,
    z.object({ connect: z.object({ id: z.string() }) }).optional(),
  ),
  location: z.preprocess(
    preprocessNested,
    z.object({ connect: z.object({ id: z.string() }) }).optional(),
  ),
});

type FormType = z.infer<typeof FormSchema>;

export default function InputForm() {
  const unfilteredQuery = trpc.node.getAll.useQuery();
  const unfilteredStaffQuery = trpc.staff.getAll.useQuery();
  const unfilteredUserQuery = trpc.user.getAll.useQuery();
  const unsortedQuery = unfilteredQuery.data
    ? unfilteredQuery.data?.filter((node) => !(node.type === "HALL"))
    : [];
  const unsortedStaffQuery = unfilteredStaffQuery.data
    ? unfilteredStaffQuery.data
    : [];
  //filter users only users that email field is populated
  const unsortedUserQuery = unfilteredUserQuery.data
    ? unfilteredUserQuery.data?.filter((user) => user.email)
    : [];
  const nodesQuery = unsortedQuery.sort(function (a, b) {
    const nodeA = a.longName.toUpperCase();
    const nodeB = b.longName.toUpperCase();
    return nodeA < nodeB ? -1 : nodeA > nodeB ? 1 : 0;
  });
  const staffQuery = unsortedStaffQuery.sort(function (a, b) {
    const staffA = a.name.toUpperCase();
    const staffB = b.name.toUpperCase();
    return staffA < staffB ? -1 : staffA > staffB ? 1 : 0;
  });
  const userQuery = unsortedUserQuery.sort(function (a, b) {
    if (a.email === null || b.email === null) {
      return 0;
    } else {
      const userA = a.email.toUpperCase();
      const userB = b.email.toUpperCase();
      return userA < userB ? -1 : userA > userB ? 1 : 0;
    }
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    shouldUnregister: true,
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: DateTime.now().toISODate(),
      sex: "" as FormType["sex"],
      identity: {
        create: {
          idNumber: "",
          idType: "" as FormType["identity"]["create"]["idType"],
        },
      },
      location: {
        connect: {
          id: "",
        },
      },
      insurance: "",
      pcp: {
        connect: {
          id: "",
        },
      },
      phoneNumber: "",
      user: {
        connect: {
          id: "",
        },
      },
    },
  });

  // const { requests, setRequests } = useContext(RequestsContext);
  // const session = useAuth0();
  const utils = trpc.useUtils();
  const createPatientRequest = trpc.patient.createOne.useMutation();

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (data.location)
      data.location.connect.id =
        nodesQuery.find((n) => data.location?.connect.id === n.longName)?.id ??
        "";

    const createPatient = createPatientRequest.mutateAsync(
      {
        ...data,
      },
      {
        onSuccess: () => {
          utils.patient.getAll.invalidate();
        },
      },
    );

    toast.promise(createPatient, {
      success: "Successfully saved to the database.",
      loading: "Saving patient request to the database.",
      error: "Error saving to database.",
    });

    try {
      await createPatient;
      form.reset();
    } catch {
      console.error("Error :(");
    }
  }

  return (
    <>
      <Card className="h-full backdrop-blur-lg flex-1 flex flex-col overflow-auto z-0 bg-white/90 ">
        <CardHeader>
          <CardTitle className="capitalize">Patient Creation</CardTitle>
        </CardHeader>
        <CardFooter className="text-muted-foreground text-xs ">
          * Required fields
        </CardFooter>
        <CardContent className="flex-1 flex flex-col justify-between items-center h-full gap-2 ">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full h-full flex flex-col justify-between items-stretch gap-4"
            >
              <div className="flex flex-row gap-2 items-end">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>First Name*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Middle Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Last Name*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-row gap-2 items-end">
                <FormField
                  control={form.control}
                  name="insurance"
                  render={({ field }) => (
                    <FormItem className="flex flex-col flex-1">
                      <FormLabel>Patient's Insurance</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an insurance provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="MassHealth">MassHealth</SelectItem>
                          <SelectItem value="Aetna">Aetna</SelectItem>
                          <SelectItem value="Cigna">Cigna</SelectItem>
                          <SelectItem value="Blue Cross">Blue Cross</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.connect.id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full justify-between flex-1">
                      <FormLabel>Location</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? nodesQuery.find(
                                    (node) => node.longName === field.value,
                                  )?.longName
                                : "Select location"}
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[310px] max-h-[200px] overflow-scroll p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search locations..."
                              className="h-9"
                            />
                            <CommandEmpty>No location found.</CommandEmpty>
                            <CommandGroup>
                              {nodesQuery.map((location) => (
                                <CommandItem
                                  value={location.longName}
                                  key={location.longName}
                                  onSelect={() => {
                                    form.setValue(
                                      "location.connect.id",
                                      location.longName,
                                    );
                                  }}
                                >
                                  {location.longName}
                                  <CheckIcon
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      location.longName === field.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-row gap-2 items-end">
                <FormField
                  control={form.control}
                  name="identity.create.idNumber"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>ID*</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="identity.create.idType"
                  render={({ field }) => (
                    <FormItem className="flex-1 ">
                      <FormLabel>ID Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type of ID" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ssn">SSN</SelectItem>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="driverLicense">
                            Driver License
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pcp.connect.id"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>PCP</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? staffQuery.find(
                                    (staff) => staff.id === field.value,
                                  )?.name
                                : "Select Staff"}
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[310px] max-h-[200px] overflow-scroll p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search employee..."
                              className="h-9"
                            />
                            <CommandEmpty>No employee found.</CommandEmpty>
                            <CommandGroup>
                              {staffQuery.map((assignee) => (
                                <CommandItem
                                  value={assignee.name}
                                  key={assignee.name}
                                  onSelect={() => {
                                    form.setValue(
                                      "pcp.connect.id",
                                      assignee.id,
                                    );
                                  }}
                                >
                                  {assignee.name}
                                  <CheckIcon
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      assignee.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-row gap-2 items-end">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Date of Birth*</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Phone #</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Sex assigned at birth*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Patients Sex" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="user.connect.id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link user email</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value
                              ? userQuery.find(
                                  (user) => user.id === field.value,
                                )?.email
                              : "Select User Email"}
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[310px] max-h-[200px] overflow-scroll p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search user..."
                            className="h-9"
                          />
                          <CommandEmpty>No email found.</CommandEmpty>
                          <CommandGroup>
                            {userQuery.map((user) => (
                              <CommandItem
                                value={user.email ?? ""}
                                key={user.email}
                                onSelect={() => {
                                  form.setValue("user.connect.id", user.id);
                                }}
                              >
                                {user.email}
                                <CheckIcon
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    user.email === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="flex flex-col flex-1">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea className="flex-1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    form.reset();
                  }}
                >
                  Reset
                </Button>
                <Button className="flex-1 " type="submit">
                  Submit
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}

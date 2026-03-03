"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Input,
  Field,
  Table,
  Badge,
  IconButton,
  InputGroup,
  Switch,
  HStack,
  Dialog,
  useDisclosure,
  VStack,
  Separator,
  Grid,
  GridItem,
  Card,
  Icon,
  Stack,
  Container,
  Portal,
  Float,
} from "@chakra-ui/react";
import { CapitalizedInput } from "@/component/form/CapitalizedInput";
import { toaster } from "@/components/ui/toaster";
import {
  Save,
  X,
  Eye,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  EyeOff,
  UserPlus,
  Users,
  AlertTriangle,
} from "lucide-react";

/* ================= TYPES ================= */

interface OperatorFormData {
  operatorName: string;
  employeeName: string;
  password: string;
  confirmPassword: string;
  activeHardcode: boolean;
}

interface Operator extends Omit<OperatorFormData, "confirmPassword"> {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/* ================= VALIDATION ================= */

const operatorSchema = z
  .object({
    operatorName: z.string().min(1, "Operator name is required").max(50),
    employeeName: z.string().min(1, "Employee name is required").max(50),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    activeHardcode: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type OperatorFormSchema = z.infer<typeof operatorSchema>;

/* ================= MOCK DATA ================= */

const MOCK_OPERATORS: Operator[] = [
  {
    id: "1",
    operatorName: "OP001",
    employeeName: "John Doe",
    password: "password123",
    activeHardcode: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    operatorName: "OP002",
    employeeName: "Jane Smith",
    password: "password456",
    activeHardcode: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    operatorName: "OP003",
    employeeName: "Mike Johnson",
    password: "password789",
    activeHardcode: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/* ================= COMPONENT ================= */

export default function OperatorManagementPage() {
  /* ---------- STATE ---------- */

  const [operators, setOperators] = useState<Operator[]>(MOCK_OPERATORS);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const itemsPerPage = 5;
  const { open, onOpen, onClose } = useDisclosure();

  /* ---------- FORM ---------- */

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<OperatorFormSchema>({
    resolver: zodResolver(operatorSchema),
    mode: "onChange",
    defaultValues: {
      operatorName: "",
      employeeName: "",
      password: "",
      confirmPassword: "",
      activeHardcode: true,
    },
  });

  const activeHardcode = watch("activeHardcode");

  /* ---------- FILTER + PAGINATION ---------- */

  const filteredOperators = useMemo(() => {
    return operators.filter(
      (op) =>
        op.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [operators, searchTerm]);

  const totalPages = Math.ceil(filteredOperators.length / itemsPerPage);

  const paginatedOperators = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOperators.slice(start, start + itemsPerPage);
  }, [filteredOperators, currentPage]);

  const activeCount = operators.filter((op) => op.activeHardcode).length;
  const inactiveCount = operators.length - activeCount;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  /* ---------- HANDLERS ---------- */

  const resetForm = () => {
    reset();
    setSelectedOperator(null);
    setShowPassword(false);
  };

  const onSubmit: SubmitHandler<OperatorFormSchema> = (data) => {
    if (selectedOperator) {
      setOperators((prev) =>
        prev.map((op) =>
          op.id === selectedOperator.id
            ? { ...op, ...data, updatedAt: new Date().toISOString() }
            : op
        )
      );

      toaster.create({
        title: "Operator updated successfully",
        type: "success",
      });
    } else {
      const newOperator: Operator = {
        id: Date.now().toString(),
        operatorName: data.operatorName,
        employeeName: data.employeeName,
        password: data.password,
        activeHardcode: data.activeHardcode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setOperators((prev) => [newOperator, ...prev]);

      toaster.create({
        title: "Operator created successfully",
        type: "success",
      });
    }

    resetForm();
  };

  const handleEdit = (operator: Operator) => {
    setSelectedOperator(operator);
    Object.entries(operator).forEach(([key, value]) => {
      if (key in operatorSchema.shape) {
        setValue(key as keyof OperatorFormSchema, value as any, {
          shouldDirty: false,
        });
      }
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = () => {
    if (!deleteId) return;

    setOperators((prev) => prev.filter((op) => op.id !== deleteId));

    toaster.create({
      title: "Operator deleted successfully",
      type: "info",
    });

    setDeleteId(null);
    onClose();
  };

  /* ================= UI ================= */

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="7xl">
        {/* HEADER WITH STATS */}
        <VStack align="stretch" gap={6} mb={8}>
          <Flex justify="space-between" align="center">
            <VStack align="start" gap={1}>
              <Heading size="2xl" fontWeight="bold" color="gray.800">
                Operator Management
              </Heading>
              <Text color="gray.600" fontSize="md">
                Manage system operators and their access credentials
              </Text>
            </VStack>
          </Flex>

          {/* STATS CARDS */}
         <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
  {/* Total Operators */}
  <Card.Root
    bgGradient="linear(to-r, blue.100, blue.50)"
    borderRadius="xl"
    shadow="lg"
    _hover={{ shadow: "2xl", transform: "translateY(-3px)" }}
    transition="all 0.3s"
  >
    <Card.Body p={4}>
      <HStack justify="space-between">
        <VStack align="start" gap={0.5}>
          <Text fontSize="sm" color="blue.800" fontWeight="medium">
            Total Operators
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="blue.900">
            {operators.length}
          </Text>
        </VStack>
        <Box
          p={3}
          bg="blue.600"
          borderRadius="full"
          color="white"
          boxShadow="md"
        >
          <Icon as={Users} boxSize={5} />
        </Box>
      </HStack>
    </Card.Body>
  </Card.Root>

  {/* Active */}
  <Card.Root
    bgGradient="linear(to-r, green.100, green.50)"
    borderRadius="xl"
    shadow="lg"
    _hover={{ shadow: "2xl", transform: "translateY(-3px)" }}
    transition="all 0.3s"
  >
    <Card.Body p={4}>
      <HStack justify="space-between">
        <VStack align="start" gap={0.5}>
          <Text fontSize="sm" color="green.800" fontWeight="medium">
            Active
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="green.900">
            {activeCount}
          </Text>
        </VStack>
        <Box
          p={3}
          bg="green.600"
          borderRadius="full"
          color="white"
          boxShadow="md"
        >
          <Icon as={Eye} boxSize={5} />
        </Box>
      </HStack>
    </Card.Body>
  </Card.Root>

  {/* Inactive */}
  <Card.Root
    bgGradient="linear(to-r, gray.200, gray.100)"
    borderRadius="xl"
    shadow="lg"
    _hover={{ shadow: "2xl", transform: "translateY(-3px)" }}
    transition="all 0.3s"
  >
    <Card.Body p={4}>
      <HStack justify="space-between">
        <VStack align="start" gap={0.5}>
          <Text fontSize="sm" color="gray.700" fontWeight="medium">
            Inactive
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            {inactiveCount}
          </Text>
        </VStack>
        <Box
          p={3}
          bg="gray.600"
          borderRadius="full"
          color="white"
          boxShadow="md"
        >
          <Icon as={EyeOff} boxSize={5} />
        </Box>
      </HStack>
    </Card.Body>
  </Card.Root>
</Grid>
        </VStack>

        {/* MAIN CONTENT - TWO COLUMNS */}
        <Grid
          templateColumns={{ base: "1fr", lg: "400px 1fr" }}
          gap={6}
          alignItems="start"
        >
          {/* LEFT COLUMN - FORM */}
          <GridItem>
            <Card.Root
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              shadow="md"
              position="sticky"
              top={4}
            >
              <Card.Header
                bg="blue.50"
                borderBottomWidth="1px"
                borderColor="gray.200"
                py={4}
              >
                <HStack gap={3}>
                  <Box p={2} bg="blue.100" borderRadius="md">
                    <Icon
                      as={selectedOperator ? Edit : UserPlus}
                      color="blue.600"
                      boxSize={5}
                    />
                  </Box>
                  <VStack align="start" gap={0}>
                    <Heading size="md" color="gray.800">
                      {selectedOperator ? "Edit Operator" : "New Operator"}
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      {selectedOperator
                        ? "Update operator details"
                        : "Add a new operator to the system"}
                    </Text>
                  </VStack>
                </HStack>
              </Card.Header>

              <Card.Body p={6}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <VStack gap={5} align="stretch">
                    {/* Operator Name */}
                    <Field.Root invalid={!!errors.operatorName} required>
                      <Field.Label
                        fontSize="sm"
                        fontWeight="semibold"
                        color="gray.700"
                      >
                        Operator Name
                      </Field.Label>
                      <CapitalizedInput<OperatorFormSchema>
                        value={watch("operatorName")}
                        field="operatorName"
                        onChange={(field, val) => setValue(field, val)}
                        placeholder="e.g., OP001"
                        size="md"
                        isCapitalized={true}
                      />
                      {errors.operatorName && (
                        <Field.ErrorText>
                          {errors.operatorName.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>

                    {/* Employee Name */}
                    <Field.Root invalid={!!errors.employeeName} required>
                      <Field.Label
                        fontSize="sm"
                        fontWeight="semibold"
                        color="gray.700"
                      >
                        Employee Name
                      </Field.Label>
                      <CapitalizedInput<OperatorFormSchema>
                        value={watch("employeeName")}
                        field="employeeName"
                        onChange={(field, val) => setValue(field, val)}
                        placeholder="e.g., John Doe"
                        size="md"
                        isCapitalized={true}
                      />
                      {errors.employeeName && (
                        <Field.ErrorText>
                          {errors.employeeName.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>

                    {/* Password */}
                    <Field.Root invalid={!!errors.password} required>
                      <Field.Label
                        fontSize="sm"
                        fontWeight="semibold"
                        color="gray.700"
                      >
                        Password
                      </Field.Label>
                      <InputGroup
                        endElement={
                          <IconButton
                            aria-label="toggle password"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <Icon as={showPassword ? EyeOff : Eye} />
                          </IconButton>
                        }
                      >
                        <CapitalizedInput<OperatorFormSchema>
                          value={watch("password")}
                          field="password"
                          onChange={(field, val) => setValue(field, val)}
                          placeholder="Minimum 6 characters"
                          type={showPassword ? "text" : "password"}
                          size="md"
                        />
                      </InputGroup>
                      {errors.password && (
                        <Field.ErrorText>
                          {errors.password.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>

                    {/* Confirm Password */}
                    <Field.Root invalid={!!errors.confirmPassword} required>
                      <Field.Label
                        fontSize="sm"
                        fontWeight="semibold"
                        color="gray.700"
                      >
                        Confirm Password
                      </Field.Label>
                      <InputGroup
                        endElement={
                          <IconButton
                            aria-label="toggle password"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <Icon as={showPassword ? EyeOff : Eye} />
                          </IconButton>
                        }
                      >
                        <CapitalizedInput<OperatorFormSchema>
                          value={watch("confirmPassword")}
                          field="confirmPassword"
                          onChange={(field, val) => setValue(field, val)}
                          placeholder="Re-enter password"
                          type={showPassword ? "text" : "password"}
                          size="md"
                        />
                      </InputGroup>
                      {errors.confirmPassword && (
                        <Field.ErrorText>
                          {errors.confirmPassword.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>

                    {/* Active Status */}
                    <Box
                      p={4}
                      bg="gray.50"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="gray.200"
                    >
                      <HStack justify="space-between">
                        <VStack align="start" gap={0}>
                          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                            Status
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {activeHardcode
                              ? "Operator is active"
                              : "Operator is inactive"}
                          </Text>
                        </VStack>
                        <Switch.Root
                          checked={activeHardcode}
                          onCheckedChange={(e) =>
                            setValue("activeHardcode", e.checked)
                          }
                          colorPalette="blue"
                          size="lg"
                        >
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                        </Switch.Root>
                      </HStack>
                    </Box>

                    <Separator borderColor="gray.200" />

                    {/* Action Buttons */}
                    <HStack gap={3}>
                      <Button
                        flex={1}
                        onClick={resetForm}
                        variant="outline"
                        colorPalette="gray"
                        size="lg"
                      >
                        <Icon as={X} mr={2} />
                        Cancel
                      </Button>
                      <Button
                        flex={1}
                        type="submit"
                        colorPalette="blue"
                        size="lg"
                        disabled={!isDirty || !isValid}
                      >
                        <Icon as={Save} mr={2} />
                        {selectedOperator ? "Update" : "Save"}
                      </Button>
                    </HStack>
                  </VStack>
                </form>
              </Card.Body>
            </Card.Root>
          </GridItem>

          {/* RIGHT COLUMN - TABLE */}
          <GridItem>
            <Card.Root
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              shadow="md"
            >
              <Card.Header
                bg="gray.50"
                borderBottomWidth="1px"
                borderColor="gray.200"
                py={4}
              >
                <Flex justify="space-between" align="center" gap={4} wrap="wrap">
                  <VStack align="start" gap={0}>
                    <Heading size="md" color="gray.800">
                      Operators List
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      {filteredOperators.length} operator
                      {filteredOperators.length !== 1 ? "s" : ""} found
                    </Text>
                  </VStack>

                  <InputGroup
                    maxW="320px"
                    startElement={<Icon as={Search} color="gray.400" />}
                  >
                    <Input
                      placeholder="Search operators..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      size="md"
                      bg="white"
                    />
                  </InputGroup>
                </Flex>
              </Card.Header>

              <Card.Body p={0}>
                {paginatedOperators.length > 0 ? (
                  <Box overflowX="auto">
                    <Table.Root variant="outline" size="md">
                      <Table.Header bg="gray.50">
                        <Table.Row>
                          <Table.ColumnHeader fontWeight="bold" color="gray.700">
                            S.No
                          </Table.ColumnHeader>
                          <Table.ColumnHeader fontWeight="bold" color="gray.700">
                            Operator Name
                          </Table.ColumnHeader>
                          <Table.ColumnHeader fontWeight="bold" color="gray.700">
                            Employee Name
                          </Table.ColumnHeader>
                          <Table.ColumnHeader fontWeight="bold" color="gray.700">
                            Status
                          </Table.ColumnHeader>
                          <Table.ColumnHeader
                            fontWeight="bold"
                            color="gray.700"
                            textAlign="center"
                          >
                            Actions
                          </Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        {paginatedOperators.map((operator, index) => (
                          <Table.Row
                            key={operator.id}
                            _hover={{ bg: "gray.50" }}
                            transition="background 0.2s"
                          >
                            <Table.Cell color="gray.600" fontWeight="medium">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontWeight="semibold" color="gray.800">
                                {operator.operatorName}
                              </Text>
                            </Table.Cell>
                            <Table.Cell color="gray.700">
                              {operator.employeeName}
                            </Table.Cell>
                            <Table.Cell>
                              <Badge
                                colorPalette={
                                  operator.activeHardcode ? "green" : "gray"
                                }
                                size="sm"
                                variant="subtle"
                              >
                                {operator.activeHardcode ? "Active" : "Inactive"}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <HStack justify="center" gap={2}>
                                <IconButton
                                  aria-label="edit operator"
                                  size="sm"
                                  variant="ghost"
                                  colorPalette="blue"
                                  onClick={() => handleEdit(operator)}
                                >
                                  <Icon as={Edit} />
                                </IconButton>
                                <IconButton
                                  aria-label="delete operator"
                                  size="sm"
                                  variant="ghost"
                                  colorPalette="red"
                                  onClick={() => {
                                    setDeleteId(operator.id);
                                    onOpen();
                                  }}
                                >
                                  <Icon as={Trash2} />
                                </IconButton>
                              </HStack>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                ) : (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    py={12}
                    gap={3}
                  >
                    <Box
                      p={4}
                      bg="gray.100"
                      borderRadius="full"
                      color="gray.400"
                    >
                      <Icon as={Search} boxSize={8} />
                    </Box>
                    <VStack gap={1}>
                      <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                        No operators found
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {searchTerm
                          ? "Try adjusting your search term"
                          : "Add your first operator to get started"}
                      </Text>
                    </VStack>
                  </Flex>
                )}
              </Card.Body>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <Card.Footer
                  bg="gray.50"
                  borderTopWidth="1px"
                  borderColor="gray.200"
                  py={4}
                >
                  <Flex justify="space-between" align="center" w="full">
                    <Text fontSize="sm" color="gray.600">
                      Page {currentPage} of {totalPages}
                    </Text>

                    <HStack gap={2}>
                      <IconButton
                        aria-label="previous page"
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <Icon as={ChevronLeft} />
                      </IconButton>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1
                        )
                        .map((page, idx, arr) => (
                          <Box key={page}>
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <Text px={2} color="gray.400">
                                ...
                              </Text>
                            )}
                            <Button
                              size="sm"
                              variant={currentPage === page ? "solid" : "ghost"}
                              colorPalette={currentPage === page ? "blue" : "gray"}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          </Box>
                        ))}

                      <IconButton
                        aria-label="next page"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        <Icon as={ChevronRight} />
                      </IconButton>
                    </HStack>
                  </Flex>
                </Card.Footer>
              )}
            </Card.Root>
          </GridItem>
        </Grid>
      </Container>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog.Root open={open} onOpenChange={onClose}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="md">
              <Dialog.Header>
                <HStack gap={3}>
                  <Box p={2} bg="red.100" borderRadius="md">
                    <Icon as={AlertTriangle} color="red.600" boxSize={5} />
                  </Box>
                  <Dialog.Title fontSize="lg" fontWeight="bold">
                    Confirm Delete
                  </Dialog.Title>
                </HStack>
              </Dialog.Header>

              <Dialog.Body py={6}>
                <VStack align="start" gap={3}>
                  <Text color="gray.700">
                    Are you sure you want to delete this operator?
                  </Text>
                  <Box
                    w="full"
                    p={4}
                    bg="red.50"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="red.200"
                  >
                    <HStack gap={2}>
                      <Icon as={AlertTriangle} color="red.600" boxSize={4} />
                      <Text fontSize="sm" color="red.800" fontWeight="medium">
                        This action cannot be undone
                      </Text>
                    </HStack>
                  </Box>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer gap={3}>
                <Button
                  variant="outline"
                  colorPalette="gray"
                  onClick={onClose}
                  flex={1}
                >
                  Cancel
                </Button>
                <Button
                  colorPalette="red"
                  onClick={confirmDelete}
                  flex={1}
                >
                  <Icon as={Trash2} mr={2} />
                  Delete
                </Button>
              </Dialog.Footer>

              <Dialog.CloseTrigger />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
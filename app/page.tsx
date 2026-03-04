"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  Heading,
  Badge,
  Avatar,
  HStack,
  VStack,
  Progress,
  Table,
  Icon,
} from "@chakra-ui/react";
import {
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Search,
  BarChart2,
  Clock,
} from "lucide-react";
import useProtected from "@/hooks/auth/useProtected";
import Loader from "@/component/loader/Loader";
import { useRouter } from "next/navigation";


// --- Mock Data ---
const stats = [
  {
    label: "Today's Revenue",
    value: "₹1,24,850",
    change: "+12.5%",
    up: true,
    icon: DollarSign,
    color: "teal",
    bg: "#e6fffa",
    accent: "#319795",
  },
  {
    label: "Total Bills",
    value: "348",
    change: "+8.2%",
    up: true,
    icon: ShoppingCart,
    color: "blue",
    bg: "#ebf8ff",
    accent: "#3182ce",
  },
  {
    label: "Items Sold",
    value: "2,190",
    change: "+5.1%",
    up: true,
    icon: Package,
    color: "purple",
    bg: "#faf5ff",
    accent: "#805ad5",
  },
  {
    label: "Active Customers",
    value: "124",
    change: "-2.3%",
    up: false,
    icon: Users,
    color: "orange",
    bg: "#fffaf0",
    accent: "#dd6b20",
  },
];

const recentBills = [
  { id: "BL-4521", customer: "Ramesh Kumar", items: 8, amount: "₹2,340", time: "2 min ago", status: "Paid" },
  { id: "BL-4520", customer: "Priya Sharma", items: 3, amount: "₹890", time: "15 min ago", status: "Paid" },
  { id: "BL-4519", customer: "Anil Verma", items: 12, amount: "₹5,670", time: "32 min ago", status: "Pending" },
  { id: "BL-4518", customer: "Sunita Devi", items: 5, amount: "₹1,230", time: "1 hr ago", status: "Paid" },
  { id: "BL-4517", customer: "Vikram Singh", items: 2, amount: "₹420", time: "1.5 hr ago", status: "Paid" },
];

const lowStock = [
  { name: "Parle-G Biscuits", stock: 12, threshold: 50, category: "Snacks" },
  { name: "Tata Salt 1kg", stock: 8, threshold: 30, category: "Staples" },
  { name: "Surf Excel 1kg", stock: 5, threshold: 20, category: "Detergent" },
  { name: "Dettol Soap", stock: 18, threshold: 40, category: "Personal Care" },
];

const topCategories = [
  { name: "Groceries", percent: 72, color: "#319795" },
  { name: "Beverages", percent: 55, color: "#3182ce" },
  { name: "Personal Care", percent: 40, color: "#805ad5" },
  { name: "Snacks", percent: 33, color: "#dd6b20" },
  { name: "Dairy", percent: 28, color: "#d69e2e" },
];

const CountUp = ({ target, prefix = "" }: { target: number; prefix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <>{prefix}{count.toLocaleString()}</>;
};

export default function DashBoard() {

  const { user, loading } = useProtected();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login/");
  }, [loading, user, router]);

  if (loading) return <Loader isLoading fullscreen />;


  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const hours = now.getHours();

  let greeting = "Good Night";

  if (hours >= 5 && hours < 12) {
    greeting = "Good Morning";
  } else if (hours >= 12 && hours < 17) {
    greeting = "Good Afternoon";
  } else if (hours >= 17 && hours < 21) {
    greeting = "Good Evening";
  }
  return (
    <Box minH="100vh" bg="#b4cee7" fontFamily="'Segoe UI', sans-serif">

      {/* TOP NAV */}
      {/* <Flex
        bg="white"
        px={6}
        py={3}
        align="center"
        justify="space-between"
        borderBottom="1px solid"
        borderColor="gray.100"
        boxShadow="sm"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <HStack gap={3}>
          <Box bg="teal.500" borderRadius="lg" p={2}>
            <Icon as={ShoppingCart} color="white" boxSize={5} />
          </Box>
          <VStack gap={0} align="start">
            <Text fontWeight="800" fontSize="lg" color="gray.800" lineHeight={1.2}>RTM POS</Text>
            <Text fontSize="10px" color="teal.500" fontWeight="600" letterSpacing="wider" textTransform="uppercase">Departmental Store</Text>
          </VStack>
        </HStack>

        <HStack gap={4}>
          <Flex
            bg="gray.50"
            borderRadius="full"
            px={4}
            py={2}
            align="center"
            gap={2}
            border="1px solid"
            borderColor="gray.200"
            w="240px"
          >
            <Icon as={Search} boxSize={4} color="gray.400" />
            <Text color="gray.400" fontSize="sm">Search anything...</Text>
          </Flex>

          <HStack gap={1} bg="gray.50" borderRadius="full" px={3} py={2} border="1px solid" borderColor="gray.100">
            <Icon as={Clock} boxSize={3.5} color="gray.500" />
            <Text fontSize="xs" color="gray.600" fontWeight="600">{timeStr}</Text>
          </HStack>

          <Box position="relative" cursor="pointer">
            <Box bg="gray.50" borderRadius="full" p={2} border="1px solid" borderColor="gray.200">
              <Icon as={Bell} boxSize={4} color="gray.600" />
            </Box>
            <Box position="absolute" top="-1px" right="-1px" bg="red.500" borderRadius="full" w={2} h={2} />
          </Box>

          <HStack gap={2} cursor="pointer">
            <Avatar.Root size="sm">
              <Avatar.Fallback name="Store Manager" />
            </Avatar.Root>
            <VStack gap={0} align="start" display={{ base: "none", md: "flex" }}>
              <Text fontSize="sm" fontWeight="700" color="gray.800">Store Manager</Text>
              <Text fontSize="10px" color="gray.400">Admin</Text>
            </VStack>
          </HStack>
        </HStack>
      </Flex> */}

      {/* MAIN CONTENT */}
      <Box px={6} py={5} maxW="1400px" mx="auto">

        {/* HEADER */}
        <Flex align="center" justify="space-between" mb={6}>
          <Box>
            <Heading size="lg" color="gray.800" fontWeight="800">
              {greeting}! 👋
            </Heading>
            <Text color="gray.500" fontSize="sm" mt={0.5}>
              {dateStr}
            </Text>
          </Box>
        </Flex>

        {/* STAT CARDS */}
        <Grid templateColumns={{ base: "1fr 1fr", lg: "repeat(4, 1fr)" }} gap={4} mb={6}>
          {stats.map((s) => (
            <GridItem key={s.label}>
              <Box bg="white" borderRadius="2xl" p={5} boxShadow="sm" border="1px solid" borderColor="gray.100" _hover={{ boxShadow: "md", transform: "translateY(-2px)" }} transition="all 0.2s">
                <Flex justify="space-between" align="start" mb={4}>
                  <Box bg={s.bg} borderRadius="xl" p={3}>
                    <Icon as={s.icon} boxSize={5} color={s.accent} />
                  </Box>
                  <Badge
                    colorScheme={s.up ? "green" : "red"}
                    borderRadius="full"
                    px={2}
                    py={0.5}
                    fontSize="xs"
                    display="flex"
                    alignItems="center"
                    gap={0.5}
                  >
                    <Icon as={s.up ? ArrowUpRight : ArrowDownRight} boxSize={3} />
                    {s.change}
                  </Badge>
                </Flex>
                <Text fontSize="2xl" fontWeight="800" color="gray.800">{s.value}</Text>
                <Text fontSize="sm" color="gray.500" mt={0.5}>{s.label}</Text>
              </Box>
            </GridItem>
          ))}
        </Grid>

        {/* MIDDLE ROW */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 380px" }} gap={4} mb={4}>

          {/* RECENT BILLS */}
          <Box bg="white" borderRadius="2xl" p={5} boxShadow="sm" border="1px solid" borderColor="gray.100">
            <Flex justify="space-between" align="center" mb={4}>
              <HStack gap={2}>
                <Icon as={BarChart2} color="teal.500" boxSize={5} />
                <Heading size="sm" color="gray.700">Recent Bills</Heading>
              </HStack>
              <Text fontSize="xs" color="teal.500" fontWeight="600" cursor="pointer" _hover={{ textDecoration: "underline" }}>View All →</Text>
            </Flex>
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  {["Bill ID", "Customer", "Items", "Amount", "Time", "Status"].map((h) => (
                    <Table.ColumnHeader
                      key={h}
                      color="gray.400"
                      fontWeight="600"
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      pb={3}
                    >
                      {h}
                    </Table.ColumnHeader>
                  ))}
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {recentBills.map((b, i) => (
                  <Table.Row
                    key={i}
                    _hover={{ bg: "gray.50" }}
                    transition="background 0.15s"
                  >
                    <Table.Cell fontWeight="700" color="teal.600" fontSize="sm">
                      {b.id}
                    </Table.Cell>

                    <Table.Cell fontSize="sm" color="gray.700" fontWeight="500">
                      {b.customer}
                    </Table.Cell>

                    <Table.Cell fontSize="sm" color="gray.500">
                      {b.items}
                    </Table.Cell>

                    <Table.Cell fontSize="sm" fontWeight="700" color="gray.800">
                      {b.amount}
                    </Table.Cell>

                    <Table.Cell fontSize="xs" color="gray.400">
                      {b.time}
                    </Table.Cell>

                    <Table.Cell>
                      <Badge
                        colorScheme={b.status === "Paid" ? "green" : "orange"}
                        borderRadius="full"
                        px={3}
                        py={0.5}
                        fontSize="xs"
                        fontWeight="600"
                      >
                        {b.status}
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>

          {/* TOP CATEGORIES */}
          <Box bg="white" borderRadius="2xl" p={5} boxShadow="sm" border="1px solid" borderColor="gray.100">
            <HStack gap={2} mb={4}>
              <Icon as={TrendingUp} color="purple.500" boxSize={5} />
              <Heading size="sm" color="gray.700">Sales by Category</Heading>
            </HStack>
            <VStack gap={4} align="stretch">
              {topCategories.map((cat, i) => (
                <Box key={i}>
                  <Flex justify="space-between" mb={1.5}>
                    <Text fontSize="sm" fontWeight="600" color="gray.700">{cat.name}</Text>
                    <Text fontSize="sm" fontWeight="700" color="gray.800">{cat.percent}%</Text>
                  </Flex>
                  <Progress.Root value={cat.percent} size="sm" borderRadius="full">
                    <Progress.Track borderRadius="full" bg="gray.100">
                      <Progress.Range borderRadius="full" style={{ background: cat.color }} />
                    </Progress.Track>
                  </Progress.Root>
                </Box>
              ))}
            </VStack>

            {/* Quick Stats */}
            <Box mt={6} pt={4} borderTop="1px solid" borderColor="gray.100">
              <Grid templateColumns="1fr 1fr" gap={3}>
                <Box bg="teal.50" borderRadius="xl" p={3} textAlign="center">
                  <Text fontSize="xl" fontWeight="800" color="teal.600">₹4,820</Text>
                  <Text fontSize="xs" color="teal.500" fontWeight="600">Avg. Bill Value</Text>
                </Box>
                <Box bg="purple.50" borderRadius="xl" p={3} textAlign="center">
                  <Text fontSize="xl" fontWeight="800" color="purple.600">6.3</Text>
                  <Text fontSize="xs" color="purple.500" fontWeight="600">Avg. Items/Bill</Text>
                </Box>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Box>
    </Box>
  );
}
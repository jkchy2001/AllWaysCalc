
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/header';
import Link from 'next/link';
import { Home, Network } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const formSchema = z.object({
  ipAddress: z.string().regex(ipRegex, "Invalid IP address format."),
  cidr: z.number().min(0).max(32),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    ipAddress: string;
    subnetMask: string;
    networkAddress: string;
    broadcastAddress: string;
    hostRangeStart: string;
    hostRangeEnd: string;
    totalHosts: number;
    usableHosts: number;
};

const ipToLong = (ip: string) => {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
};

const longToIp = (long: number) => {
    return [
        (long >>> 24) & 255,
        (long >>> 16) & 255,
        (long >>> 8) & 255,
        long & 255
    ].join('.');
};

export default function IpSubnetCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ipAddress: '192.168.1.1',
      cidr: 24,
    },
  });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const calculateSubnet = (data: FormValues) => {
    const { ipAddress, cidr } = data;
    const ipLong = ipToLong(ipAddress);
    
    const maskLong = ((1 << 31) >> (cidr - 1)) ^ -1;
    const subnetMask = longToIp(maskLong);
    
    const networkAddressLong = ipLong & maskLong;
    const networkAddress = longToIp(networkAddressLong);
    
    const broadcastAddressLong = networkAddressLong | (~maskLong >>> 0);
    const broadcastAddress = longToIp(broadcastAddressLong);
    
    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = totalHosts > 2 ? totalHosts - 2 : 0;
    
    const hostRangeStart = usableHosts > 0 ? longToIp(networkAddressLong + 1) : 'N/A';
    const hostRangeEnd = usableHosts > 0 ? longToIp(broadcastAddressLong - 1) : 'N/A';

    setResult({
        ipAddress,
        subnetMask,
        networkAddress,
        broadcastAddress,
        hostRangeStart,
        hostRangeEnd,
        totalHosts,
        usableHosts,
    });
  }

  // Initial calculation on load
  useEffect(() => {
    calculateSubnet(form.getValues());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (data: FormValues) => {
    calculateSubnet(data);
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
              <Home className="size-4" /> Home
            </Link>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">IP Subnet Calculator</CardTitle>
                <CardDescription>Analyze IPv4 subnets.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="ipAddress">IP Address</Label>
                    <Input id="ipAddress" placeholder="e.g., 192.168.1.1" {...register('ipAddress')} />
                    {errors.ipAddress && <p className="text-destructive text-sm">{errors.ipAddress.message}</p>}
                  </div>
                  <Controller
                    name="cidr"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label>CIDR Prefix: /{field.value}</Label>
                        <Slider
                          min={0}
                          max={32}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                      </div>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Subnet Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Subnet Mask</TableCell>
                                <TableCell className="text-right font-mono">{result.subnetMask}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Network Address</TableCell>
                                <TableCell className="text-right font-mono">{result.networkAddress}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Usable Host Range</TableCell>
                                <TableCell className="text-right font-mono text-xs">{result.hostRangeStart} - {result.hostRangeEnd}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="font-medium">Broadcast Address</TableCell>
                                <TableCell className="text-right font-mono">{result.broadcastAddress}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="font-medium">Total Hosts</TableCell>
                                <TableCell className="text-right font-mono">{result.totalHosts.toLocaleString()}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="font-medium">Usable Hosts</TableCell>
                                <TableCell className="text-right font-mono">{result.usableHosts.toLocaleString()}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`Network details for ${result.ipAddress}/${form.getValues('cidr')}: Network Address ${result.networkAddress}, Broadcast ${result.broadcastAddress}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="font-headline">Understanding IP Subnetting</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">
                        Subnetting is the process of dividing a single, large IP network into smaller, more manageable sub-networks, or "subnets". This calculator helps you understand the properties of a given IPv4 subnet.
                    </p>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>What is CIDR?</AccordionTrigger>
                            <AccordionContent>
                            CIDR (Classless Inter-Domain Routing) is a method for allocating IP addresses and routing Internet Protocol packets. The number after the slash (e.g., /24) represents the number of bits in the network portion of the address, which determines the size of the subnet.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Why are there fewer usable hosts than total hosts?</AccordionTrigger>
                            <AccordionContent>
                            In any subnet, two addresses are reserved and cannot be assigned to devices. The first address is the Network Address (which identifies the network itself), and the last address is the Broadcast Address (used to send data to all devices on the network).
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}

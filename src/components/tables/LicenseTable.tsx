// // components/tables/LicenseTable.tsx
// 'use client';

// // ... imports existants ...
// import { Badge } from '@/components/ui/badge'; // Utilisation de ton composant Badge
// import { useAuthPermissions } from '@/hooks/index'; // Import du hook de permissions
// import { usePermissions } from '@/lib/auth/permissions';
// import { Table } from 'lucide-react';
// import { TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
// import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react';
// import { formatDate } from 'date-fns';
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuLabel,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
// } from '@/components/ui/dropdown-menu'


// const getStatusBadgeVariant = (status: string | null) => {
//   switch (status) {
//     case 'active':
//       return 'success';
//     case 'expired':
//       return 'expired';
//     case 'about_to_expire':
//       return 'warning';
//     case 'cancelled':
//       return 'secondary';
//     default:
//       return 'default';
//   }
// };

// export function LicenseTable({ data }: LicenseTableProps) {
//   const { can } = usePermissions(); // Utilisation du hook de permissions

//   if (!data || data.length === 0) {
//     return <p>Aucune licence trouvée.</p>;
//   }

//   return (
//     <div className="rounded-md border">
//       <Table>
//         <TableHeader>
//           {/* ... TableHead existant ... */}
//         </TableHeader>
//         <TableBody>
//           {data.map((license: { id: Key | null | undefined; client_name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; editor: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; expiry_date: any; status: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
//             <TableRow key={license.id}>
//               {/* ... Cellules existantes ... */}
//               <TableCell>{license.client_name}</TableCell>
//               <TableCell>{license.editor}</TableCell>
//               <TableCell>{formatDate(license.expiry_date)}</TableCell>
//               <TableCell>
//                 <Badge variant={getStatusBadgeVariant(license.status)}>
//                   {license.status}
//                 </Badge>
//               </TableCell>
//               {can('update', 'licenses') && ( // Condition pour afficher les actions
//                 <TableCell className="text-right">
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" className="h-8 w-8 p-0">
//                         <span className="sr-only">Ouvrir le menu</span>
//                         <MoreHorizontal className="h-4 w-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                       <DropdownMenuItem>Voir les détails</DropdownMenuItem>
//                       {can('update', 'licenses') && (
//                         <DropdownMenuItem>Modifier</DropdownMenuItem>
//                       )}
//                       {can('delete', 'licenses') && (
//                         <DropdownMenuSeparator />
//                       )}
//                       {can('delete', 'licenses') && (
//                         <DropdownMenuItem className="text-red-600">
//                           Supprimer
//                         </DropdownMenuItem>
//                       )}
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//               )}
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }
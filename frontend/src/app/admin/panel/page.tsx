"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { Trash2, Ban, Unlock, Clapperboard, ArrowUp, ArrowDown } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GenreTrendChart from "@/components/GenreTrendChart";
import LogViewer from "@/components/LogViewer";

interface User {
  userId: number;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsLoggedIn(true);

      try {
        const decoded: any = jwtDecode(token);
        if (decoded.role) {
          setUserRole(decoded.role);
        }
      } catch (err) {
        console.error("Token konnte nicht dekodiert werden:", err);
      }

      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Kein Token gefunden. Bitte melde dich an.");
      }
      const res = await fetch("http://localhost:4000/users", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Fehler beim Laden der User:", error);
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm("Willst du diesen Benutzer wirklich löschen?")) return;

    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:4000/delete/user/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
    }
  };

  const toggleBlockUser = async (user: User) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:4000/admin/users/${user.userId}/block`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ block: !user.isBlocked }),
        }
      );

      if (!res.ok) throw new Error("Fehler beim Sperren/Entsperren");

      // UI aktualisieren
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === user.userId ? { ...u, isBlocked: !u.isBlocked } : u
        )
      );
    } catch (err) {
      console.error("Fehler beim Sperren/Entsperren:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/");
  };

  // Spalten-Definition inkl. Sortieroptionen; für die Aktionen-Spalte schalten wir das Sortieren aus
  const columns = useMemo<ColumnDef<User>[]>(() => [
    { accessorKey: "userId", header: "ID", enableSorting: true },
    { accessorKey: "name", header: "Name", enableSorting: true },
    { accessorKey: "email", header: "E-Mail", enableSorting: true },
    { accessorKey: "role", header: "Rolle", enableSorting: true },
    {
      header: "Status",
      accessorFn: (row) => (row.isBlocked ? "Gesperrt" : "Aktiv"),
      id: "status",
      enableSorting: true,
    },
    {
      header: "Aktionen",
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex gap-2">
            <button
              onClick={() => deleteUser(user.userId)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => toggleBlockUser(user)}
              className={`hover:text-yellow-700 ${
                user.isBlocked ? "text-green-500" : "text-yellow-500"
              }`}
            >
              {user.isBlocked ? (
                <Unlock className="w-5 h-5" />
              ) : (
                <Ban className="w-5 h-5" />
              )}
            </button>
          </div>
        );
      },
    },
  ], [users]);

  const table = useReactTable({
    data: users,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#1E0000] to-black text-white">
      <header className="flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <Link href="/">
          <div className="relative w-[300px] h-[80px] cursor-pointer">
            <img
              src="https://i.ibb.co/CpmRBD0X/image.png"
              alt="DualStream Logo"
              className="object-contain"
              width={300}
              height={80}
            />
          </div>
        </Link>

        {isLoggedIn && (
          <div className="flex items-center gap-4">
            {/* Startseite-Button */}
            <button
              onClick={() => router.push("/home")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition flex items-center gap-2"
            >
              <Clapperboard className="w-5 h-5" />
              Zu den Filmen
            </button>

            {/* Benutzer Dropdown */}
            <div className="relative inline-block text-left">
              <button
                type="button"
                className="inline-flex items-center justify-center w-full rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A13.937 13.937 0 0112 15c3.866 0 7.36 1.567 9.879 4.096M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {userRole === "ADMIN" ? "Admin" : "Benutzer"}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black/10 focus:outline-none">
                  <div className="py-1">
                    <button
                      onClick={() => router.push("/admin/panel")}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      Admin-Panel
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-red-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Tabelle */}
      <main className="px-8 py-8">
        <h1 className="text-5xl font-bold mb-6">Admin-Panel</h1>
        <h2 className="text-3xl font-bold mb-6">Benutzerverwaltung</h2>

        <div className="border border-gray-700 rounded-lg overflow-hidden shadow-lg">
          <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-800 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-300 border-b border-gray-700"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            onClick={header.column.getToggleSortingHandler()}
                            className={
                              header.column.getCanSort()
                                ? "cursor-pointer select-none flex items-center"
                                : ""
                            }
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getIsSorted() === "asc" ? (
                              <ArrowUp className="w-4 h-4 ml-1" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ArrowDown className="w-4 h-4 ml-1" />
                            ) : null}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-gray-900">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-800 transition border-b border-gray-800"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-100"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Genre-Bewertungstrends</h2>
          <GenreTrendChart />
        </section>
        <LogViewer />
      </main>
    </div>
  );
}

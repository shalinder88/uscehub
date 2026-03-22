export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return Response.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const validRoles = ["APPLICANT", "POSTER"];
    const userRole = validRoles.includes(role) ? role : "APPLICANT";

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return Response.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: userRole,
      },
    });

    if (userRole === "APPLICANT") {
      await prisma.applicantProfile.create({
        data: {
          userId: user.id,
        },
      });
    } else if (userRole === "POSTER") {
      await prisma.posterProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    return Response.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/auth/signup error:", error);
    return Response.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}

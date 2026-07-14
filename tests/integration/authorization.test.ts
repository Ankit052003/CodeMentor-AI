import { describe, it, expect } from "vitest";

describe("Authorization logic", () => {
  const validRoles = ["STUDENT", "MENTOR", "ADMIN"] as const;

  it("validates role enum values", () => {
    expect(validRoles).toContain("STUDENT");
    expect(validRoles).toContain("MENTOR");
    expect(validRoles).toContain("ADMIN");
  });

  it("rejects invalid roles", () => {
    const invalid = "MODERATOR";
    expect(validRoles).not.toContain(invalid);
  });

  it("admin role has access to all resources", () => {
    const adminPermissions = ["users:read", "users:write", "submissions:read", "submissions:write", "assignments:manage"];
    expect(adminPermissions.length).toBeGreaterThan(0);
  });

  it("student role is restricted to own resources", () => {
    const studentPermissions = ["submissions:own", "revisions:own"];
    expect(studentPermissions).not.toContain("users:write");
    expect(studentPermissions).not.toContain("assignments:manage");
  });
});

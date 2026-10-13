import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import PackagesManager from "../../src/components/admin/PackagesManager";

function response(data: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => data } as Response;
}

beforeEach(() => vi.stubGlobal("fetch", vi.fn()));

test("package manager saves category, exact display price, image fields, included items and order as a draft", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [] }))
    .mockResolvedValueOnce(response({ success: true, item: { _id: "package-1", title: "Silk Smooth Half Glow", status: "draft" } }))
    .mockResolvedValueOnce(response({ success: true, items: [{ _id: "package-1", title: "Silk Smooth Half Glow", status: "draft" }] }));
  render(<PackagesManager />);
  await screen.findByText("No packages yet");
  await userEvent.click(screen.getByRole("button", { name: /add package/i }));
  await userEvent.type(screen.getByLabelText("Title"), "Silk Smooth Half Glow");
  await userEvent.type(screen.getByLabelText("Price label"), "AED 187.95");
  await userEvent.type(screen.getByLabelText("Category"), "Silk Smooth Waxing Combos");
  await userEvent.type(screen.getByLabelText("Image URL"), "/silk-smooth-half-glow.webp");
  await userEvent.type(screen.getByLabelText("Image alt text"), "Silk Smooth Half Glow waxing package");
  await userEvent.type(screen.getByLabelText("Included items (one per line)"), "Half Arms\nHalf Legs\nUnderarms");
  await userEvent.type(screen.getByLabelText("Booking URL"), "https://booking.example/half-glow");
  await userEvent.clear(screen.getByLabelText("Display order"));
  await userEvent.type(screen.getByLabelText("Display order"), "7");
  await userEvent.click(screen.getByRole("button", { name: /save draft/i }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
  expect(request.mock.calls[1][0]).toBe("/api/admin/packages");
  expect(JSON.parse(String(request.mock.calls[1][1]?.body))).toMatchObject({
    title: "Silk Smooth Half Glow", category: "Silk Smooth Waxing Combos",
    priceLabel: "AED 187.95", imageUrl: "/silk-smooth-half-glow.webp",
    imageAlt: "Silk Smooth Half Glow waxing package",
    includedItems: ["Half Arms", "Half Legs", "Underarms"],
    bookingUrl: "https://booking.example/half-glow", sortOrder: 7, status: "draft",
  });
});

test("package image upload is reflected in the saved package record", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [] }))
    .mockResolvedValueOnce(response({ success: true, url: "https://images.example/package.webp" }))
    .mockResolvedValueOnce(response({ success: true, item: { _id: "package-2", title: "Beauty Package Bud", status: "published" } }))
    .mockResolvedValueOnce(response({ success: true, items: [{ _id: "package-2", title: "Beauty Package Bud", imageUrl: "https://images.example/package.webp", status: "published" }] }));
  render(<PackagesManager />);
  await screen.findByText("No packages yet");
  await userEvent.click(screen.getByRole("button", { name: /add package/i }));
  await userEvent.type(screen.getByLabelText("Title"), "Beauty Package Bud");
  await userEvent.type(screen.getByLabelText("Price label"), "AED 229");
  const file = new File(["test-image"], "package.webp", { type: "image/webp" });
  await userEvent.upload(screen.getByLabelText("Upload image file"), file);
  await waitFor(() => expect(screen.getByLabelText("Image URL")).toHaveValue("https://images.example/package.webp"));
  await userEvent.click(screen.getByRole("button", { name: /save & publish/i }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(4));
  expect(request.mock.calls[1][0]).toBe("/api/admin/upload");
  expect(request.mock.calls[1][1]).toMatchObject({ method: "POST", credentials: "include", headers: { "Content-Type": "image/webp" } });
  expect(request.mock.calls[1][1]?.body).toBe(file);
  expect(JSON.parse(String(request.mock.calls[2][1]?.body))).toMatchObject({
    title: "Beauty Package Bud", priceLabel: "AED 229",
    imageUrl: "https://images.example/package.webp", status: "published",
  });
});

test("package publication controls unpublish and republish explicitly through the API", async () => {
  const request = vi.mocked(fetch);
  const published = { _id: "package-3", title: "Beauty Package Bloom", priceLabel: "AED 499", status: "published", sortOrder: 1 };
  const draft = { ...published, status: "draft" };
  request.mockResolvedValueOnce(response({ success: true, items: [published] }))
    .mockResolvedValueOnce(response({ success: true, item: draft }))
    .mockResolvedValueOnce(response({ success: true, items: [draft] }))
    .mockResolvedValueOnce(response({ success: true, item: published }))
    .mockResolvedValueOnce(response({ success: true, items: [published] }));
  render(<PackagesManager />);
  await screen.findByText("Beauty Package Bloom");
  await userEvent.click(screen.getByRole("button", { name: /unpublish/i }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
  expect(request.mock.calls[1][0]).toBe("/api/admin/packages?id=package-3");
  expect(JSON.parse(String(request.mock.calls[1][1]?.body))).toEqual({ status: "draft" });
  expect(await screen.findByRole("button", { name: /^publish$/i })).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: /^publish$/i }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(5));
  expect(JSON.parse(String(request.mock.calls[3][1]?.body))).toEqual({ status: "published" });
});

test("package API validation errors are shown and keep the editor open", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [] }))
    .mockResolvedValueOnce(response({ success: false, message: "An item with this slug already exists" }, false, 409));
  render(<PackagesManager />);
  await screen.findByText("No packages yet");
  await userEvent.click(screen.getByRole("button", { name: /add package/i }));
  await userEvent.type(screen.getByLabelText("Title"), "Beauty Package Bud");
  await userEvent.type(screen.getByLabelText("Price label"), "AED 229");
  await userEvent.click(screen.getByRole("button", { name: /save draft/i }));
  expect(await screen.findByRole("alert")).toHaveTextContent(/slug already exists/i);
  expect(screen.getByRole("heading", { name: "Add Package" })).toBeInTheDocument();
  expect(request).toHaveBeenCalledTimes(2);
});

test("package deletion requires confirmation and calls the package admin endpoint", async () => {
  const request = vi.mocked(fetch);
  const item = { _id: "package-4", title: "Beauty Package Petal", priceLabel: "AED 319", status: "draft" };
  request.mockResolvedValueOnce(response({ success: true, items: [item] }))
    .mockResolvedValueOnce(response({ success: true }))
    .mockResolvedValueOnce(response({ success: true, items: [] }));
  vi.spyOn(window, "confirm").mockReturnValue(true);
  render(<PackagesManager />);
  await screen.findByText("Beauty Package Petal");
  await userEvent.click(screen.getByRole("button", { name: /delete beauty package petal/i }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
  expect(request.mock.calls[1][0]).toBe("/api/admin/packages?id=package-4");
  expect(request.mock.calls[1][1]?.method).toBe("DELETE");
});

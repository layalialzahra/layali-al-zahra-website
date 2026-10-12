import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import ServicesManager from "../../src/components/admin/ServicesManager";
import FaqManager from "../../src/components/admin/FaqManager";

function response(data: unknown) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

beforeEach(() => vi.stubGlobal("fetch", vi.fn()));

test("service manager publishes only after the explicit Save & Publish action", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [] }))
    .mockResolvedValueOnce(response({ success: true, item: { _id: "new", title: "Hair Cut", status: "published" } }))
    .mockResolvedValueOnce(response({ success: true, items: [{ _id: "new", title: "Hair Cut", status: "published" }] }));
  render(<ServicesManager />);
  await screen.findByText("No services yet");
  await userEvent.click(screen.getByRole("button", { name: /add service/i }));
  await userEvent.type(screen.getByLabelText("Title"), "Hair Cut");
  await userEvent.click(screen.getByRole("button", { name: /save & publish/i }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
  expect(request.mock.calls[1][0]).toBe("/api/admin/services");
  expect(JSON.parse(String(request.mock.calls[1][1]?.body))).toMatchObject({ title: "Hair Cut", status: "published" });
});

test("FAQ manager reloads records when the page filter changes", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValue(response({ success: true, items: [] }));
  render(<FaqManager />);
  await screen.findByText("No FAQs yet");
  await userEvent.selectOptions(screen.getByLabelText("FAQ page"), "offers");
  await waitFor(() => expect(request).toHaveBeenLastCalledWith("/api/admin/faqs?limit=100&pageKey=offers", expect.objectContaining({ credentials: "include" })));
});

test("published records can be unpublished and then locally deleted", async () => {
  const request = vi.mocked(fetch);
  const published = { _id: "abc", title: "Hair Cuts", slug: "hair-cuts", status: "published", sortOrder: 0, subservices: [] };
  const draft = { ...published, status: "draft" };
  request.mockResolvedValueOnce(response({ success: true, items: [published] }))
    .mockResolvedValueOnce(response({ success: true, item: draft }))
    .mockResolvedValueOnce(response({ success: true, items: [draft] }))
    .mockResolvedValueOnce(response({ success: true }))
    .mockResolvedValueOnce(response({ success: true, items: [] }));
  vi.spyOn(window, "confirm").mockReturnValue(true);
  render(<ServicesManager />);
  await screen.findByText("Hair Cuts");
  await userEvent.click(screen.getByRole("button", { name: /unpublish/i }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
  expect(JSON.parse(String(request.mock.calls[1][1]?.body))).toEqual({ status: "draft" });
  await userEvent.click(screen.getByRole("button", { name: /delete hair cuts/i }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(5));
  expect(request.mock.calls[3][1]?.method).toBe("DELETE");
});

test("admin navigation opens the Services manager without replacing the Content Library", async () => {
  const request = vi.mocked(fetch);
  request.mockImplementation(async (input) => {
    const url = String(input);
    if (url === "/api/admin/auth") return response({ success: true, authenticated: true, admin: { username: "Tester" } });
    if (url.startsWith("/api/admin/content")) return response({ success: true, items: [], total: 0 });
    if (url.startsWith("/api/admin/services")) return response({ success: true, items: [] });
    return response({ success: true, items: [], total: 0 });
  });
  const { default: AdminPage } = await import("../../src/components/AdminPage");
  render(<AdminPage />);
  await screen.findByText("Welcome back.");
  await userEvent.click(screen.getByRole("button", { name: /services/i }));
  await screen.findByText("No services yet");
  expect(screen.getByRole("button", { name: /content library/i })).toBeInTheDocument();
});

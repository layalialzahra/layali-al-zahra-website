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


test("editing a service saves the changed title and numeric display order without losing draft intent", async () => {
  const request = vi.mocked(fetch);
  const service = { _id: "service-1", title: "Hair Cuts", slug: "hair-cuts", description: "Classic cuts", status: "published", sortOrder: 8, subservices: [] };
  const updated = { ...service, title: "Hair Styling", status: "draft", sortOrder: 2 };
  request.mockResolvedValueOnce(response({ success: true, items: [service] }))
    .mockResolvedValueOnce(response({ success: true, item: updated }))
    .mockResolvedValueOnce(response({ success: true, items: [updated] }));
  render(<ServicesManager />);
  await screen.findByText("Hair Cuts");
  await userEvent.click(screen.getByRole("button", { name: /edit hair cuts/i }));
  const title = screen.getByLabelText("Title");
  await userEvent.clear(title);
  await userEvent.type(title, "Hair Styling");
  const order = screen.getByLabelText("Display order");
  await userEvent.clear(order);
  await userEvent.type(order, "2");
  await userEvent.click(screen.getByRole("button", { name: /save draft/i }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
  expect(request.mock.calls[1][0]).toBe("/api/admin/services?id=service-1");
  expect(JSON.parse(String(request.mock.calls[1][1]?.body))).toMatchObject({
    title: "Hair Styling", status: "draft", sortOrder: 2,
  });
});

test("shows the API duplicate-slug validation message and keeps the editor open", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [] }))
    .mockResolvedValueOnce(response({ success: false, message: "An item with this slug already exists" }));
  render(<ServicesManager />);
  await screen.findByText("No services yet");
  await userEvent.click(screen.getByRole("button", { name: /add service/i }));
  await userEvent.type(screen.getByLabelText("Title"), "Hair Cuts");
  await userEvent.type(screen.getByLabelText("URL slug"), "hair-cuts");
  await userEvent.click(screen.getByRole("button", { name: /save draft/i }));
  expect(await screen.findByRole("alert")).toHaveTextContent(/slug already exists/i);
  expect(screen.getByRole("heading", { name: "Add Service" })).toBeInTheDocument();
  expect(request).toHaveBeenCalledTimes(2);
});

test("creating a service as a draft uses the explicit Save Draft action", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [] }))
    .mockResolvedValueOnce(response({ success: true, item: { _id: "draft-1", title: "Hair Spa", status: "draft" } }))
    .mockResolvedValueOnce(response({ success: true, items: [{ _id: "draft-1", title: "Hair Spa", status: "draft" }] }));
  render(<ServicesManager />);
  await screen.findByText("No services yet");
  await userEvent.click(screen.getByRole("button", { name: /add service/i }));
  await userEvent.type(screen.getByLabelText("Title"), "Hair Spa");
  await userEvent.click(screen.getByRole("button", { name: /save draft/i }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
  expect(JSON.parse(String(request.mock.calls[1][1]?.body))).toMatchObject({ title: "Hair Spa", status: "draft" });
});


test("service categories have separate add and rename controls", async () => {
  const request = vi.mocked(fetch);
  let categories = [{ id: "cat-1", name: "Hair" }];
  request.mockImplementation(async (input, init) => {
    const url = String(input);
    if (url.startsWith("/api/admin/service-categories")) {
      if (init?.method === "POST") { categories = [...categories, { id: "cat-2", name: JSON.parse(String(init.body)).name }]; return response({ success: true, item: categories[1] }); }
      if (init?.method === "PUT") { const body = JSON.parse(String(init.body)); categories = categories.map((item) => item.name === body.oldName ? { ...item, name: body.name } : item); return response({ success: true, item: categories[0] }); }
      return response({ success: true, items: categories });
    }
    if (url.startsWith("/api/admin/services")) return response({ success: true, items: [] });
    return response({ success: true, items: [] });
  });
  render(<ServicesManager />);
  await screen.findByRole("heading", { name: "Service categories" });
  await screen.findByText("Hair");
  await userEvent.type(screen.getByPlaceholderText("Category name"), "Nails");
  await userEvent.click(screen.getByRole("button", { name: "Add category" }));
  await screen.findByText("Nails");
  expect(request).toHaveBeenCalledWith("/api/admin/service-categories", expect.objectContaining({ method: "POST" }));
  await userEvent.click(screen.getAllByRole("button", { name: "Edit category" })[0]);
  const input = screen.getByPlaceholderText("Category name");
  await userEvent.clear(input);
  await userEvent.type(input, "Hair & Styling");
  await userEvent.click(screen.getByRole("button", { name: "Save category" }));
  await screen.findByText("Hair & Styling");
  expect(request).toHaveBeenCalledWith("/api/admin/service-categories", expect.objectContaining({ method: "PUT" }));
});

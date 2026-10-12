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

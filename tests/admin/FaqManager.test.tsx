import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import FaqManager from "../../src/components/admin/FaqManager";

function response(data: unknown, ok = true) {
  return { ok, status: ok ? 200 : 400, json: async () => data } as Response;
}

beforeEach(() => vi.stubGlobal("fetch", vi.fn()));

test("FAQ manager filters by the selected page and creates a FAQ for that page", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [] }))
    .mockResolvedValueOnce(response({ success: true, items: [] }))
    .mockResolvedValueOnce(response({ success: true, item: {
      _id: "faq-offer-1", pageKey: "offers", question: "Can I combine offers?", answer: "Check the offer terms.", status: "published",
    } }))
    .mockResolvedValueOnce(response({ success: true, items: [{
      _id: "faq-offer-1", pageKey: "offers", question: "Can I combine offers?", answer: "Check the offer terms.", status: "published",
    }] }));

  render(<FaqManager />);
  await screen.findByText("No FAQs yet");
  expect(String(request.mock.calls[0][0])).toContain("pageKey=services");

  await userEvent.selectOptions(screen.getByRole("combobox", { name: "FAQ page" }), "offers");
  await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  expect(String(request.mock.calls[1][0])).toContain("pageKey=offers");

  await userEvent.click(screen.getByRole("button", { name: /add faq/i }));
  expect(screen.getByLabelText("Page")).toHaveValue("offers");
  await userEvent.type(screen.getByLabelText("Question"), "Can I combine offers?");
  await userEvent.type(screen.getByLabelText("Answer"), "Check the offer terms.");
  await userEvent.click(screen.getByRole("button", { name: /save & publish/i }));

  await waitFor(() => expect(request).toHaveBeenCalledTimes(4));
  expect(request.mock.calls[2][0]).toBe("/api/admin/faqs");
  expect(JSON.parse(String(request.mock.calls[2][1]?.body))).toMatchObject({
    pageKey: "offers", question: "Can I combine offers?", answer: "Check the offer terms.", status: "published",
  });
  expect(await screen.findByText("Can I combine offers?")).toBeInTheDocument();
  expect(screen.getByText("offers")).toBeInTheDocument();
});

test("FAQ manager reports API validation errors and leaves the editor open", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [] }))
    .mockResolvedValueOnce(response({ success: false, message: "Invalid FAQ page key" }, false));

  render(<FaqManager />);
  await screen.findByText("No FAQs yet");
  await userEvent.click(screen.getByRole("button", { name: /add faq/i }));
  await userEvent.type(screen.getByLabelText("Question"), "Where does this belong?");
  await userEvent.type(screen.getByLabelText("Answer"), "It must have a page.");
  await userEvent.selectOptions(screen.getByLabelText("Page"), "packages");
  await userEvent.click(screen.getByRole("button", { name: /save draft/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent(/invalid faq page key/i);
  expect(screen.getByRole("heading", { name: "Add FAQ" })).toBeInTheDocument();
  expect(request).toHaveBeenCalledTimes(2);
});

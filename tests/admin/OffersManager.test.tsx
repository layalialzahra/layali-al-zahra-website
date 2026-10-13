import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import OffersManager from "../../src/components/admin/OffersManager";

function response(data: unknown) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

beforeEach(() => vi.stubGlobal("fetch", vi.fn()));

test("offer manager saves exact price labels and inclusive date-range values on explicit publish", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [] }))
    .mockResolvedValueOnce(response({ success: true, item: { _id: "offer-1", title: "Leap Day Offer", status: "published" } }))
    .mockResolvedValueOnce(response({ success: true, items: [{ _id: "offer-1", title: "Leap Day Offer", priceLabel: "AED 99.75", status: "published" }] }));
  render(<OffersManager />);
  await screen.findByText("No offers yet");
  await userEvent.click(screen.getByRole("button", { name: /add offer/i }));
  await userEvent.type(screen.getByLabelText("Title"), "Leap Day Offer");
  await userEvent.type(screen.getByLabelText("Price label"), "AED 99.75");
  await userEvent.selectOptions(screen.getByLabelText("Offer validity"), "date-range");
  await userEvent.type(screen.getByLabelText("Valid from"), "2028-02-29");
  await userEvent.type(screen.getByLabelText("Valid until"), "2028-02-29");
  await userEvent.click(screen.getByRole("button", { name: /save & publish/i }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
  expect(JSON.parse(String(request.mock.calls[1][1]?.body))).toMatchObject({
    title: "Leap Day Offer", priceLabel: "AED 99.75", validityType: "date-range",
    validFrom: "2028-02-29", validUntil: "2028-02-29", status: "published",
  });
});

test("offer manager keeps recurring labels as text and omits date bounds", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [] }))
    .mockResolvedValueOnce(response({ success: true, item: { _id: "offer-2", title: "Monday Offer", status: "draft" } }))
    .mockResolvedValueOnce(response({ success: true, items: [{ _id: "offer-2", title: "Monday Offer", status: "draft" }] }));
  render(<OffersManager />);
  await screen.findByText("No offers yet");
  await userEvent.click(screen.getByRole("button", { name: /add offer/i }));
  await userEvent.type(screen.getByLabelText("Title"), "Monday Offer");
  await userEvent.type(screen.getByLabelText("Price label"), "AED 105");
  await userEvent.selectOptions(screen.getByLabelText("Offer validity"), "recurring");
  expect(screen.queryByLabelText("Valid from")).not.toBeInTheDocument();
  await userEvent.type(screen.getByLabelText("Validity label"), "Every Monday");
  await userEvent.click(screen.getByRole("button", { name: /save draft/i }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
  const payload = JSON.parse(String(request.mock.calls[1][1]?.body));
  expect(payload).toMatchObject({ priceLabel: "AED 105", validityType: "recurring", validityLabel: "Every Monday", status: "draft" });
  expect("validFrom" in payload).toBe(false);
  expect("validUntil" in payload).toBe(false);
});

import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// --- str_replace_editor ---

test("shows 'Creating <file>' for str_replace_editor create command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        toolCallId: "1",
        state: "call",
        args: { command: "create", path: "/src/components/Button.tsx" },
      }}
    />
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("shows 'Editing <file>' for str_replace_editor str_replace command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        toolCallId: "2",
        state: "call",
        args: { command: "str_replace", path: "/src/components/Card.tsx" },
      }}
    />
  );
  expect(screen.getByText("Editing Card.tsx")).toBeDefined();
});

test("shows 'Editing <file>' for str_replace_editor insert command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        toolCallId: "3",
        state: "call",
        args: { command: "insert", path: "/src/app/page.tsx" },
      }}
    />
  );
  expect(screen.getByText("Editing page.tsx")).toBeDefined();
});

test("shows 'Reading <file>' for str_replace_editor view command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        toolCallId: "4",
        state: "call",
        args: { command: "view", path: "/src/lib/utils.ts" },
      }}
    />
  );
  expect(screen.getByText("Reading utils.ts")).toBeDefined();
});

test("shows 'Undoing edit on <file>' for str_replace_editor undo_edit command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        toolCallId: "5",
        state: "call",
        args: { command: "undo_edit", path: "/src/components/Input.tsx" },
      }}
    />
  );
  expect(screen.getByText("Undoing edit on Input.tsx")).toBeDefined();
});

// --- file_manager ---

test("shows 'Deleting <file>' for file_manager delete command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: "file_manager",
        toolCallId: "6",
        state: "call",
        args: { command: "delete", path: "/src/components/OldComponent.tsx" },
      }}
    />
  );
  expect(screen.getByText("Deleting OldComponent.tsx")).toBeDefined();
});

test("shows 'Renaming <file> to <new>' for file_manager rename command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: "file_manager",
        toolCallId: "7",
        state: "call",
        args: {
          command: "rename",
          path: "/src/components/Foo.tsx",
          new_path: "/src/components/Bar.tsx",
        },
      }}
    />
  );
  expect(screen.getByText("Renaming Foo.tsx to Bar.tsx")).toBeDefined();
});

test("shows 'Renaming <file>' for file_manager rename without new_path", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: "file_manager",
        toolCallId: "8",
        state: "call",
        args: { command: "rename", path: "/src/components/Foo.tsx" },
      }}
    />
  );
  expect(screen.getByText("Renaming Foo.tsx")).toBeDefined();
});

// --- fallback ---

test("falls back to tool name for unknown tools", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: "some_unknown_tool",
        toolCallId: "9",
        state: "call",
        args: {},
      }}
    />
  );
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

// --- loading vs done state ---

test("shows spinner when state is 'call'", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        toolCallId: "10",
        state: "call",
        args: { command: "create", path: "/src/App.tsx" },
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot when state is 'result'", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        toolCallId: "11",
        state: "result",
        args: { command: "create", path: "/src/App.tsx" },
        result: "Success",
      }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

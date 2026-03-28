export type UserRole = "citizen" | "officer" | "official";

export interface User {
	_id: string;
	name: string;
	email: string;
	role: UserRole;
	department?: string;
}

export interface Issue {
	_id: string;
	title: string;
	description: string;
	category?: string;
	department?: string;
	status: "pending" | "assigned" | "in_progress" | "resolved" | "closed";
	priority: "low" | "medium" | "high";
	location?: {
		address?: string;
		city?: string;
		pincode?: string;
	};
	createdBy?: string | User;
	assignedTo?: string | User;
	createdAt?: string;
	updatedAt?: string;
}

export interface IssueUpdate {
	_id: string;
	issueId: string;
	userId: string | User;
	message: string;
	statusUpdate?: string;
	createdAt?: string;
}

type CreateIssuePayload = {
	title: string;
	description: string;
	category?: string;
	department?: string;
	priority?: "low" | "medium" | "high";
	location?: {
		address?: string;
		city?: string;
		pincode?: string;
	};
	createdBy: string;
};

const API_BASE = "";

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
	const url = `${API_BASE}${path}`;
	const response = await fetch(url, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...(options.headers || {}),
		},
	});

	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		const message = (data as { error?: string }).error || `Request failed (${response.status})`;
		throw new Error(message);
	}

	return data as T;
}

export function listUsers() {
	return apiFetch<User[]>("/api/users");
}

export function createUser(payload: Omit<User, "_id">) {
	return apiFetch<User>("/api/users", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export function listIssues() {
	return apiFetch<Issue[]>("/api/issues");
}

export function listUserIssues(userId: string) {
	return apiFetch<Issue[]>(`/api/issues/user/${userId}`);
}

export function createIssue(payload: CreateIssuePayload) {
	return apiFetch<Issue>("/api/issues", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export function assignIssue(issueId: string, officerId: string, actorUserId?: string) {
	return apiFetch<Issue>(`/api/issues/${issueId}/assign`, {
		method: "PUT",
		headers: actorUserId ? { "x-user-id": actorUserId } : undefined,
		body: JSON.stringify({ officerId }),
	});
}

export function updateIssueStatus(issueId: string, status: Issue["status"]) {
	return apiFetch<Issue>(`/api/issues/${issueId}/status`, {
		method: "PUT",
		body: JSON.stringify({ status }),
	});
}

export function listIssueUpdates(issueId: string) {
	return apiFetch<IssueUpdate[]>(`/api/updates/${issueId}`);
}

export function createIssueUpdate(payload: Omit<IssueUpdate, "_id">) {
	return apiFetch<IssueUpdate>("/api/updates", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export async function getOrCreateDemoUser(role: UserRole) {
	const defaults: Record<UserRole, Omit<User, "_id">> = {
		citizen: {
			name: "Alex Mehta",
			email: "alex.citizen@prana.local",
			role: "citizen",
			department: "public",
		},
		officer: {
			name: "D. Jackson",
			email: "jackson.officer@prana.local",
			role: "officer",
			department: "field-ops",
		},
		official: {
			name: "Command Official",
			email: "official@prana.local",
			role: "official",
			department: "command",
		},
	};

	const users = await listUsers();
	const existingRoleUser = users.find((user) => user.role === role);
	if (existingRoleUser) {
		return existingRoleUser;
	}

	try {
		return await createUser(defaults[role]);
	} catch (err) {
		const message = err instanceof Error ? err.message.toLowerCase() : "";
		if (!message.includes("email already exists")) {
			throw err;
		}

		const fallbackUser: Omit<User, "_id"> = {
			...defaults[role],
			email: `${role}.${Date.now()}@prana.local`,
		};
		return createUser(fallbackUser);
	}
}

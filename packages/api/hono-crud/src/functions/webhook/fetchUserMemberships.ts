import { Context } from "hono";
import { HonoConfig } from "../../config";
import { HTTPException } from "hono/http-exception";

export async function fetchUserMemberships(
  userId: string,
  c: Context<HonoConfig>,
): Promise<OrganizationMembership> {
  try {
    /* Grab users organization memberships (Throw this in function eventually)*/
    const userMembershipsRes = await fetch(
      `https://api.clerk.com/v1/users/${userId}/organization_memberships?limit=10&offset=0`,
      {
        headers: {
          Authorization: `Bearer ${c.env.CLERK_SECRET_KEY}`,
        },
      },
    );
    const userMemberships: OrganizationMembership =
      await userMembershipsRes.json();

    return userMemberships;
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    } else {
      throw new HTTPException(500, {
        message: `Unable to fetch user memberships \n ${error}`,
      });
    }
  }
}

type OrganizationMembership = {
  data: {
    object: string;
    id: string;
    public_metadata: Record<string, unknown>;
    private_metadata: Record<string, unknown>;
    role: string;
    permissions: string[];
    created_at: number;
    updated_at: number;
    organization: {
      object: string;
      id: string;
      name: string;
      slug: string;
      image_url: string | null;
      has_image: boolean;
      max_allowed_memberships: number;
      admin_delete_enabled: boolean;
      public_metadata: Record<string, unknown>;
      private_metadata: Record<string, unknown>;
      created_by: string;
      created_at: number;
      updated_at: number;
      logo_url: string | null;
    };
    public_user_data: {
      first_name: string;
      last_name: string;
      image_url: string | null;
      has_image: boolean;
      identifier: string;
      profile_image_url: string;
      user_id: string;
    };
  }[];
  total_count: number;
};

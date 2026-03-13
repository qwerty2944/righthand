"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
} from "@/shared/ui";
import { useGetClinicMembers } from "@/entities/clinic-member";
import { useGetInvitations } from "@/entities/invitation";
import { useRemovingMember } from "@/features/removingMember";
import { useCancellingInvitation } from "@/features/cancellingInvitation";
import { InviteMemberDialog } from "@/widgets/invite-member-dialog";

export default function MembersPage() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { data: members, isLoading: membersLoading } = useGetClinicMembers();
  const { data: invitations, isLoading: invitationsLoading } = useGetInvitations();
  const removeMember = useRemovingMember();
  const cancelInvitation = useCancellingInvitation();

  const handleRemoveMember = async (memberId: string, userId: string) => {
    if (!confirm("정말로 이 멤버를 분리하시겠습니까?")) return;

    try {
      await removeMember.mutateAsync({ memberId, userId });
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm("정말로 이 초대를 취소하시겠습니까?")) return;

    try {
      await cancelInvitation.mutateAsync(invitationId);
    } catch (error) {
      console.error("Failed to cancel invitation:", error);
    }
  };

  const pendingInvitations = invitations?.filter((inv) => inv.status === "pending") || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">멤버 관리</h1>
        <Button onClick={() => setInviteDialogOpen(true)}>초대하기</Button>
      </div>

      {/* 멤버 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>멤버 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <p className="text-muted-foreground">로딩 중...</p>
          ) : !members || members.length === 0 ? (
            <p className="text-muted-foreground">등록된 멤버가 없습니다.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                        {member.role === "owner" ? "원장" : "직원"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.joined_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      {member.role !== "owner" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id, member.user_id)}
                          disabled={removeMember.isPending}
                        >
                          분리
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 대기중 초대 */}
      <Card>
        <CardHeader>
          <CardTitle>대기중 초대</CardTitle>
        </CardHeader>
        <CardContent>
          {invitationsLoading ? (
            <p className="text-muted-foreground">로딩 중...</p>
          ) : pendingInvitations.length === 0 ? (
            <p className="text-muted-foreground">대기중인 초대가 없습니다.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이메일/코드</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>만료일</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div>
                        {invitation.email && <div>{invitation.email}</div>}
                        <code className="text-xs text-muted-foreground">
                          {invitation.code}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={invitation.role === "owner" ? "default" : "secondary"}>
                        {invitation.role === "owner" ? "원장" : "직원"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(invitation.expires_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelInvitation(invitation.id)}
                        disabled={cancelInvitation.isPending}
                      >
                        취소
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InviteMemberDialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} />
    </div>
  );
}

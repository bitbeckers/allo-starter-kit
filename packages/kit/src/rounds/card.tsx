"use client";

import { Round } from "../api/types";
import { TokenAmount } from "../ui/token-amount";
import { BackgroundImage } from "@/ui/background-image";
import { Badge } from "@/ui/badge";
import { Separator } from "@/ui/separator";
import { Card, CardContent } from "@/ui/card";

import { isAfter, formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/ui/avatar";

const toNow = (date?: string) =>
  date ? formatDistanceToNow(date, { addSuffix: true }) : undefined;

const getRoundTime = (phases: Round["phases"]): string => {
  const now = new Date();

  if (isAfter(phases.roundStart!, now))
    return `Starts ${toNow(phases.roundStart)}`;
  if (isAfter(now, phases.roundEnd!)) return `Ended ${toNow(phases.roundEnd)}`;
  if (isAfter(phases.roundEnd!, now)) return `Ends ${toNow(phases.roundEnd)}`;
  return "";
};

export function RoundCard({
  name,
  description,
  chainId,
  applications,
  matching,
  bannerUrl,
  phases,
}: Round) {
  return (
    <Card className="relative overflow-hidden rounded-3xl shadow-xl">
      <div className="">
        <BackgroundImage className="h-32 bg-gray-800" src={bannerUrl} />
        <h3 className="-mt-8 truncate pl-1 text-2xl font-medium text-gray-100">
          {name}
        </h3>
      </div>
      <CardContent className="space-y-2 p-4">
        <div className="">
          by <Badge variant={"secondary"}>ORG</Badge>
        </div>
        <p className="line-clamp-4 text-base leading-6">{description}</p>
        <div className="flex items-center justify-between text-xs">
          <div className="font-mono">{getRoundTime(phases)}</div>
          <Badge>Quadratic</Badge>
        </div>
        <Separator className="my-2" />
        <div className="">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex gap-2">
                <Badge variant={"secondary"}>
                  {applications?.length} projects
                </Badge>
                <Badge variant={"secondary"}>
                  <TokenAmount {...matching} />
                </Badge>
              </div>
            </div>
            <Avatar className="size-8">
              <AvatarFallback>{chainId}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

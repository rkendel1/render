import { Playground } from "@/components/playground";

import { PAGE_TITLES } from "@/lib/page-titles";

export const metadata = {
  title: PAGE_TITLES["playground"],
};

export default function PlaygroundPage() {
  return <Playground />;
}

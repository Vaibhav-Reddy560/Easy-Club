"use client";
import React from "react";
import DesignWorkspace from "@/components/domains/DesignWorkspace";

export default function TestDesignPage() {
  const dummyEvent = {
    id: "test_event",
    name: "Test Event",
    config: {
      city: "Bengaluru",
      type: "Technical",
      subType: "Workshop",
      isCollegeEvent: true
    }
  };

  const dummyUser = {
    uid: "test_uid",
    displayName: "Test User",
    email: "test@example.com"
  };

  return (
    <div className="w-full h-screen bg-black">
      <DesignWorkspace
        activeEvent={dummyEvent as any}
        user={dummyUser as any}
        updateConfig={() => {}}
        onLogActivity={() => {}}
        onClose={() => {}}
      />
    </div>
  );
}

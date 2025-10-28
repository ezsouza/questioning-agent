"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import StorageUsageBar from "./storage-usage-bar"

interface SettingsPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsPopup({ open, onOpenChange }: SettingsPopupProps) {
  const [tab, setTab] = useState("storage")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurações da Conta</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="mt-4">
          <TabsList>
            <TabsTrigger value="storage">Armazenamento</TabsTrigger>
          </TabsList>
          <TabsContent value="storage" className="mt-2">
            <StorageUsageBar />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsPopup

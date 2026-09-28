'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, Spinner } from '@/components/ui';
import { FOLLOW_UP_TONES, FOLLOW_UP_LENGTHS, FOLLOW_UP_TYPES } from '@/lib/utils/constants';
import { Copy, Send, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { FollowUp } from '@/types';

interface FollowUpTypeOption {
  value: 'email' | 'linkedin' | 'call_script';
  label: string;
}

interface FollowUpToneOption {
  value: 'professional' | 'casual' | 'direct' | 'consultative';
  label: string;
}

interface FollowUpLengthOption {
  value: 'short' | 'medium' | 'long';
  label: string;
}

interface FollowUpGeneratorProps {
  leadId: string;
  existingFollowUps?: FollowUp[];
  isGenerating: boolean;
  onGenerate: (params: { type: string; tone?: string; length?: string }) => Promise<void>;
}

export function FollowUpGenerator({ leadId, existingFollowUps = [], isGenerating, onGenerate }: FollowUpGeneratorProps) {
  const [selectedType, setSelectedType] = useState<'email' | 'linkedin' | 'call_script'>('email');
  const [selectedTone, setSelectedTone] = useState<'professional' | 'casual' | 'direct' | 'consultative'>('professional');
  const [selectedLength, setSelectedLength] = useState<'short' | 'medium' | 'long'>('medium');

  const handleGenerate = async () => {
    await onGenerate({ type: selectedType, tone: selectedTone, length: selectedLength });
  };

  const handleCopy = (content: string) => {
    void navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Follow-up</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Type</Label>
            <Select value={selectedType} onValueChange={(v: 'email' | 'linkedin' | 'call_script') => setSelectedType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOLLOW_UP_TYPES.map((t: FollowUpTypeOption) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tone</Label>
            <Select value={selectedTone} onValueChange={(v: 'professional' | 'casual' | 'direct' | 'consultative') => setSelectedTone(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOLLOW_UP_TONES.map((t: FollowUpToneOption) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Length</Label>
            <Select value={selectedLength} onValueChange={(v: 'short' | 'medium' | 'long') => setSelectedLength(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOLLOW_UP_LENGTHS.map((l: FollowUpLengthOption) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={isGenerating} variant="primary" className="w-full">
          {isGenerating ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Generate
            </>
          )}
        </Button>

        {existingFollowUps.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <p className="text-sm font-medium">Generated Follow-ups</p>
            {existingFollowUps.map((fu) => (
              <Card key={fu.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm text-muted-foreground">
                      {fu.type === 'email' && 'Email'}
                      {fu.type === 'linkedin' && 'LinkedIn'}
                      {fu.type === 'call_script' && 'Call Script'}
                      {' · '}
                      {fu.tone || 'professional'}
                      {' · '}
                      {fu.length || 'medium'}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(fu.content)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    readOnly
                    value={fu.content}
                    rows={6}
                    className="resize-none"
                    aria-label={`${fu.type} follow-up content`}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

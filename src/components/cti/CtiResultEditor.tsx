
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import CtiResultViewer from './CtiResultViewer';

interface CtiResultEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const CtiResultEditor: React.FC<CtiResultEditorProps> = ({ content, onChange }) => {
  const [editableContent, setEditableContent] = useState(content);
  const [activeTab, setActiveTab] = useState('edit');
  
  useEffect(() => {
    setEditableContent(content);
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditableContent(newContent);
    onChange(newContent);
  };

  const insertFormatting = (formatType: string) => {
    let textToInsert = '';
    const textarea = document.getElementById('cti-editor') as HTMLTextAreaElement;
    
    switch (formatType) {
      case 'title1':
        textToInsert = '# ';
        break;
      case 'title2':
        textToInsert = '## ';
        break;
      case 'title3':
        textToInsert = '### ';
        break;
      case 'list':
        textToInsert = '- ';
        break;
      case 'numbered':
        textToInsert = '1. ';
        break;
      case 'important':
        textToInsert = '[IMPORTANT] ';
        break;
      case 'alert':
        textToInsert = '[ALERTE] ';
        break;
      case 'critical':
        textToInsert = '[CRITIQUE] ';
        break;
      default:
        textToInsert = '';
    }
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentLineStart = editableContent.lastIndexOf('\n', start - 1) + 1;
      
      // Insert formatting at the start of the line
      const updatedContent = 
        editableContent.substring(0, currentLineStart) + 
        textToInsert + 
        editableContent.substring(currentLineStart);
      
      setEditableContent(updatedContent);
      onChange(updatedContent);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + textToInsert.length, end + textToInsert.length);
      }, 0);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="edit">Édition</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="space-y-4 pt-4">
          <div className="bg-muted/50 rounded-lg p-3 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => insertFormatting('title1')}>
              Titre principal
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => insertFormatting('title2')}>
              Sous-titre
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => insertFormatting('title3')}>
              Petit titre
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => insertFormatting('list')}>
              Liste à puces
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => insertFormatting('numbered')}>
              Liste numérotée
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => insertFormatting('important')}>
              Important
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => insertFormatting('alert')}>
              Alerte
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => insertFormatting('critical')}>
              Critique
            </Button>
          </div>
          
          <Textarea
            id="cti-editor"
            value={editableContent}
            onChange={handleContentChange}
            className="min-h-[400px] font-mono"
            placeholder="Éditez le contenu ici..."
          />
        </TabsContent>
        
        <TabsContent value="preview" className="pt-4">
          <Card className="border rounded-lg">
            <CtiResultViewer content={editableContent} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CtiResultEditor;

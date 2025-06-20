
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, Activity } from 'lucide-react';

const ActionLog = () => {
  const { getActionLogs } = useAuth();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const actionLogs = getActionLogs();
    setLogs(actionLogs);
  }, [getActionLogs]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('deleted') || action.includes('banned')) return 'bg-red-500';
    if (action.includes('unbanned') || action.includes('registered')) return 'bg-green-500';
    if (action.includes('changed') || action.includes('reset')) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <Card className="bg-gray-800 border-red-500">
      <CardHeader>
        <CardTitle className="text-red-400 flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          System Action Log
        </CardTitle>
        <p className="text-gray-400">Track all administrative actions on the website</p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No actions recorded yet</p>
            ) : (
              logs.map((log: any) => (
                <div key={log.id} className="p-3 border border-red-700 rounded-lg bg-gray-900">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={`${getActionBadgeColor(log.action)} text-white text-xs`}>
                          {log.action.split(':')[0]}
                        </Badge>
                        <span className="text-gray-300 text-sm">{log.action}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <User className="h-3 w-3" />
                        <span>Performed by: {log.performedBy}</span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>{formatTimestamp(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActionLog;

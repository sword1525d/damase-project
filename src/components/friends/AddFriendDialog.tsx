
'use client';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFirestore, useUser, addDocumentNonBlocking } from "@/firebase";
import { collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { UserPlus } from "lucide-react";
import { useState } from "react";

export function AddFriendDialog() {
  const [username, setUsername] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const firestore = useFirestore();
  const { user } = useUser();

  const handleSearch = async () => {
    if (!username.trim()) return;
    setError('');
    setSuccess('');
    setSearchResult(null);

    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where("username", "==", username.trim()));

    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setError("User not found.");
      } else {
        const foundUser = querySnapshot.docs[0].data();
        if (foundUser.id === user?.uid) {
            setError("You can't add yourself as a friend.");
            return;
        }
        setSearchResult({ id: querySnapshot.docs[0].id, ...foundUser });
      }
    } catch (e) {
      setError("Error searching for user.");
      console.error(e);
    }
  };

  const handleAddFriend = async () => {
    if (!searchResult || !user) return;
    
    const friendshipsRef = collection(firestore, 'friendships');
    
    // Check if a friendship request already exists
    const existingQuery1 = query(friendshipsRef, where('user1Id', '==', user.uid), where('user2Id', '==', searchResult.id));
    const existingQuery2 = query(friendshipsRef, where('user1Id', '==', searchResult.id), where('user2Id', '==', user.uid));

    const [snapshot1, snapshot2] = await Promise.all([getDocs(existingQuery1), getDocs(existingQuery2)]);

    if(!snapshot1.empty || !snapshot2.empty){
        setError("A friendship or friend request already exists with this user.");
        return;
    }

    const newFriendship = {
      user1Id: user.uid,
      user2Id: searchResult.id,
      status: 'pending',
      createdAt: serverTimestamp(),
      members: {
          [user.uid]: true,
          [searchResult.id]: true
      }
    };

    addDocumentNonBlocking(friendshipsRef, newFriendship)
        .then(() => {
            setSuccess(`Friend request sent to ${searchResult.username}!`);
            setSearchResult(null);
            setUsername('');
        })
        .catch(() => {
            setError("Failed to send friend request.");
        })
  };


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <UserPlus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>
            Enter the username of the person you want to add.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="col-span-3"
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}

        {searchResult && (
          <div className="flex justify-between items-center p-2 border rounded-md">
            <span>{searchResult.username}</span>
            <Button size="sm" onClick={handleAddFriend}>Add</Button>
          </div>
        )}

        <DialogFooter>
          <Button onClick={handleSearch} type="button">Search</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

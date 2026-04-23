import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Club, Question } from '@/lib/types';

export async function GET(request: Request, { params }: { params: Promise<{ clubId: string }> }) {
  try {
    const { clubId } = await params;
    
    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Firebase database not initialized' }, { status: 500 });
    }

    const clubRef = doc(db, 'clubs', clubId);
    const clubSnap = await getDoc(clubRef);

    if (!clubSnap.exists()) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    const club = clubSnap.data() as Club;

    if (club.membershipConfig?.mode !== 'test-based' || !club.membershipConfig.testDetails) {
      return NextResponse.json({ error: 'This club does not have an active online test' }, { status: 404 });
    }

    const testDetails = club.membershipConfig.testDetails;
    
    // Shuffle function
    const shuffleArray = <T>(array: T[]): T[] => {
      const newArr = [...array];
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    };

    // Strip correct answers and shuffle options and questions
    const sanitizedQuestions = shuffleArray(testDetails.questions || []).map((q: Question) => {
      const sanitized = { ...q } as Partial<Question>;
      delete sanitized.correctAnswer;
      
      // Shuffle options for MCQ and Multi
      if (sanitized.type !== 'short' && sanitized.options) {
        sanitized.options = shuffleArray(sanitized.options);
      }
      
      return sanitized;
    });

    return NextResponse.json({
      clubName: club.name,
      timeLimitMinutes: testDetails.timeLimitMinutes || 20,
      questions: sanitizedQuestions
    });

  } catch (error) {
    console.error('Error fetching test:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

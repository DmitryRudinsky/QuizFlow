import { useStore } from '@app/providers/useStore';
import { ROUTES } from '@shared/config/routes';
import { useTranslation } from '@shared/lib/useTranslation';
import { Button } from '@shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/Card';
import { Input } from '@shared/ui/Input';
import { Label } from '@shared/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/Select';
import { Textarea } from '@shared/ui/Textarea';
import {
    ArrowLeft,
    FileQuestion,
    GripVertical,
    Image as ImageIcon,
    Plus,
    Save,
    Settings,
    Trash2,
} from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import styles from './QuizBuilderPage.module.scss';

export const QuizBuilderPage = observer(() => {
    const { id: quizId } = useParams();
    const navigate = useNavigate();
    const { quizBuilder } = useStore();
    const { t } = useTranslation();
    const isEditing = !!quizId;

    useEffect(() => {
        if (isEditing && quizId) {
            quizBuilder.loadForEdit(quizId);
        } else {
            quizBuilder.reset();
        }
    }, [quizId, isEditing, quizBuilder]);

    const handleSave = () => {
        if (!quizBuilder.quizTitle || quizBuilder.questions.length === 0) {
            toast.error('Please add a title and at least one question');
            return;
        }
        const success = quizBuilder.save();
        if (success) {
            toast.success('Quiz saved successfully!');
            setTimeout(() => navigate(ROUTES.ORGANIZER_DASHBOARD), 500);
        }
    };

    const { currentQuestion } = quizBuilder;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <div className={styles.headerLeft}>
                        <Link to={ROUTES.ORGANIZER_DASHBOARD}>
                            <Button variant='ghost' size='icon'>
                                <ArrowLeft />
                            </Button>
                        </Link>
                        <div>
                            <h2>
                                {isEditing
                                    ? t('quizBuilder.editTitle')
                                    : t('quizBuilder.createTitle')}
                            </h2>
                            <p className={styles.headerTitleSubtitle}>
                                {t('quizBuilder.subtitle')}
                            </p>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <Button
                            variant='outline'
                            onClick={() =>
                                navigate(ROUTES.ORGANIZER_QUIZ_SETTINGS(quizId || 'new'))
                            }
                        >
                            <Settings />
                            {t('quizBuilder.settings')}
                        </Button>
                        <Button onClick={handleSave}>
                            <Save />
                            {t('quizBuilder.save')}
                        </Button>
                    </div>
                </div>
            </header>

            <div className={styles.body}>
                <div className={styles.grid}>
                    <div className={styles.leftCol}>
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('quizBuilder.details')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={styles.formStack}>
                                    <div className={styles.fieldGroup}>
                                        <Label htmlFor='title'>{t('quizBuilder.quizTitle')}</Label>
                                        <Input
                                            id='title'
                                            placeholder={t('quizBuilder.quizTitlePlaceholder')}
                                            value={quizBuilder.quizTitle}
                                            onChange={(e) => quizBuilder.setTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.fieldGroup}>
                                        <Label htmlFor='description'>
                                            {t('quizBuilder.description')}
                                        </Label>
                                        <Textarea
                                            id='description'
                                            placeholder={t('quizBuilder.descPlaceholder')}
                                            value={quizBuilder.description}
                                            onChange={(e) =>
                                                quizBuilder.setDescription(e.target.value)
                                            }
                                            rows={3}
                                        />
                                    </div>
                                    <div className={styles.twoColGrid}>
                                        <div className={styles.fieldGroup}>
                                            <Label htmlFor='category'>
                                                {t('quizBuilder.category')}
                                            </Label>
                                            <Select
                                                value={quizBuilder.category}
                                                onValueChange={(v) => quizBuilder.setCategory(v)}
                                            >
                                                <SelectTrigger id='category'>
                                                    <SelectValue
                                                        placeholder={t(
                                                            'quizBuilder.categoryPlaceholder',
                                                        )}
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='programming'>
                                                        {t('quizBuilder.catProgramming')}
                                                    </SelectItem>
                                                    <SelectItem value='science'>
                                                        {t('quizBuilder.catScience')}
                                                    </SelectItem>
                                                    <SelectItem value='history'>
                                                        {t('quizBuilder.catHistory')}
                                                    </SelectItem>
                                                    <SelectItem value='general'>
                                                        {t('quizBuilder.catGeneral')}
                                                    </SelectItem>
                                                    <SelectItem value='math'>
                                                        {t('quizBuilder.catMath')}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className={styles.cardHeaderRow}>
                                <CardTitle>
                                    {t('quizBuilder.questionsHeading', {
                                        count: quizBuilder.questions.length,
                                    })}
                                </CardTitle>
                                <Button onClick={() => quizBuilder.addQuestion()} size='sm'>
                                    <Plus />
                                    {t('quizBuilder.addQuestion')}
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {quizBuilder.isEmpty ? (
                                    <div className={styles.emptyState}>
                                        <FileQuestion className={styles.emptyIcon} />
                                        <p>{t('quizBuilder.noQuestions')}</p>
                                        <p className={styles.emptyHint}>
                                            {t('quizBuilder.noQuestionsHint')}
                                        </p>
                                    </div>
                                ) : (
                                    <div className={styles.questionList}>
                                        {quizBuilder.questions.map((question, index) => (
                                            <div
                                                key={question.id}
                                                onClick={() =>
                                                    quizBuilder.selectQuestion(question.id)
                                                }
                                                className={`${styles.questionItem} ${
                                                    quizBuilder.selectedQuestionId === question.id
                                                        ? styles.questionItemActive
                                                        : ''
                                                }`}
                                            >
                                                <GripVertical className={styles.gripIcon} />
                                                <div className={styles.questionItemContent}>
                                                    <div className={styles.questionItemTitle}>
                                                        {question.questionText ||
                                                            `Question ${index + 1}`}
                                                    </div>
                                                    <div className={styles.questionItemMeta}>
                                                        {question.answers.length} answers •{' '}
                                                        {question.timeLimit}s • {question.points}{' '}
                                                        pts
                                                    </div>
                                                </div>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        quizBuilder.deleteQuestion(question.id);
                                                    }}
                                                >
                                                    <Trash2 className={styles.deleteIcon} />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className={styles.rightCol}>
                        {currentQuestion ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('quizBuilder.editQuestion')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className={styles.formStack}>
                                        <div className={styles.fieldGroup}>
                                            <Label>{t('quizBuilder.questionType')}</Label>
                                            <Select
                                                value={currentQuestion.type}
                                                onValueChange={(value) =>
                                                    quizBuilder.updateQuestion(currentQuestion.id, {
                                                        type: value as 'text' | 'image',
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='text'>
                                                        {t('quizBuilder.textQuestion')}
                                                    </SelectItem>
                                                    <SelectItem value='image'>
                                                        {t('quizBuilder.imageQuestion')}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {currentQuestion.type === 'image' && (
                                            <div className={styles.fieldGroup}>
                                                <Label>{t('quizBuilder.questionImage')}</Label>
                                                <div className={styles.imageUpload}>
                                                    <ImageIcon className={styles.imageUploadIcon} />
                                                    <p className={styles.imageUploadHint}>
                                                        {t('quizBuilder.uploadImage')}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className={styles.fieldGroup}>
                                            <Label>{t('quizBuilder.questionText')}</Label>
                                            <Textarea
                                                placeholder={t(
                                                    'quizBuilder.questionTextPlaceholder',
                                                )}
                                                value={currentQuestion.questionText}
                                                onChange={(e) =>
                                                    quizBuilder.updateQuestion(currentQuestion.id, {
                                                        questionText: e.target.value,
                                                    })
                                                }
                                                rows={3}
                                            />
                                        </div>

                                        <div className={styles.fieldGroup}>
                                            <Label>{t('quizBuilder.answerType')}</Label>
                                            <Select
                                                value={currentQuestion.answerType}
                                                onValueChange={(value) =>
                                                    quizBuilder.updateQuestion(currentQuestion.id, {
                                                        answerType: value as 'single' | 'multiple',
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='single'>
                                                        {t('quizBuilder.singleChoice')}
                                                    </SelectItem>
                                                    <SelectItem value='multiple'>
                                                        {t('quizBuilder.multipleChoice')}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className={styles.fieldGroup}>
                                            <div className={styles.cardHeaderRow}>
                                                <Label>{t('quizBuilder.answers')}</Label>
                                                <Button
                                                    onClick={() =>
                                                        quizBuilder.addAnswer(currentQuestion.id)
                                                    }
                                                    size='sm'
                                                    variant='outline'
                                                >
                                                    <Plus />
                                                    {t('common.add')}
                                                </Button>
                                            </div>
                                            <div className={styles.answerRows}>
                                                {currentQuestion.answers.map((answer) => (
                                                    <div
                                                        key={answer.id}
                                                        className={styles.answerRow}
                                                    >
                                                        <input
                                                            type={
                                                                currentQuestion.answerType ===
                                                                'single'
                                                                    ? 'radio'
                                                                    : 'checkbox'
                                                            }
                                                            checked={answer.isCorrect}
                                                            onChange={(e) =>
                                                                quizBuilder.updateAnswer(
                                                                    currentQuestion.id,
                                                                    answer.id,
                                                                    {
                                                                        isCorrect: e.target.checked,
                                                                    },
                                                                )
                                                            }
                                                            className={styles.answerCheckbox}
                                                        />
                                                        <Input
                                                            placeholder={t(
                                                                'quizBuilder.answerPlaceholder',
                                                            )}
                                                            value={answer.text}
                                                            onChange={(e) =>
                                                                quizBuilder.updateAnswer(
                                                                    currentQuestion.id,
                                                                    answer.id,
                                                                    { text: e.target.value },
                                                                )
                                                            }
                                                        />
                                                        {currentQuestion.answers.length > 2 && (
                                                            <Button
                                                                variant='ghost'
                                                                size='icon'
                                                                onClick={() =>
                                                                    quizBuilder.deleteAnswer(
                                                                        currentQuestion.id,
                                                                        answer.id,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2
                                                                    className={styles.deleteIcon}
                                                                />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={styles.twoColGrid}>
                                            <div className={styles.fieldGroup}>
                                                <Label>{t('quizBuilder.timeLimit')}</Label>
                                                <Input
                                                    type='number'
                                                    value={currentQuestion.timeLimit}
                                                    onChange={(e) =>
                                                        quizBuilder.updateQuestion(
                                                            currentQuestion.id,
                                                            {
                                                                timeLimit:
                                                                    parseInt(e.target.value) || 30,
                                                            },
                                                        )
                                                    }
                                                    min={5}
                                                    max={300}
                                                />
                                            </div>
                                            <div className={styles.fieldGroup}>
                                                <Label>{t('quizBuilder.points')}</Label>
                                                <Input
                                                    type='number'
                                                    value={currentQuestion.points}
                                                    onChange={(e) =>
                                                        quizBuilder.updateQuestion(
                                                            currentQuestion.id,
                                                            {
                                                                points:
                                                                    parseInt(e.target.value) || 100,
                                                            },
                                                        )
                                                    }
                                                    min={50}
                                                    max={1000}
                                                    step={50}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className={styles.editorEmpty}>
                                    <p>{t('quizBuilder.selectQuestion')}</p>
                                    <p className={styles.editorEmptyHint}>
                                        {t('quizBuilder.selectQuestionHint')}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});
